import { UserStatus, VerificationPurpose } from '@prisma/generated/client'

import { isProduction } from '~/config/env'
import { verifyCaptcha } from '~/lib/integrations/captcha'
import { isDisposableEmail } from '~/lib/datasets/disposable-emails'
import { normalizeEmail } from '~/lib/utils/email'
import {
	BadRequestError,
	ConflictError,
	TooManyRequestsError,
	UnauthorizedError
} from '~/lib/errors'
import { extendLogContext } from '~/lib/logger'
import { redis } from '~/lib/redis'
import { decryptEmail, encryptEmail, hashEmail } from '~/lib/security/email-crypto'
import { hashPassword, verifyPassword } from '~/lib/security/hash'
import { generateOtpCode } from '~/lib/security/otp'
import { hashVerificationCode, verificationCodeMatches } from '~/lib/security/verification-code'
import { generateUsername } from '~/lib/utils/username'
import {
	issueTokenPair,
	type RequestOrigin,
	revokeAllSessions,
	revokeSession
} from '~/modules/session/service'

import { enqueuePasswordResetCode, enqueueVerificationCode } from './jobs'
import type {
	ForgotPasswordInput,
	LoginInput,
	RegisterInput,
	ResetPasswordInput,
	VerifyRegisterInput
} from './model'
import {
	activateUser,
	consumeVerificationCode,
	createPendingUser,
	createVerificationCode,
	deletePendingUser,
	findEmailCipher,
	findLatestVerificationCode,
	findUserByEmailHash,
	incrementVerificationAttempts,
	updateLastLogin,
	updatePasswordHash
} from './repository'

export const VERIFICATION_TTL = 15 * 60
const VERIFICATION_MAX_ATTEMPTS = 5

const LOGIN_ATTEMPT_MAX = 5
const LOGIN_ATTEMPT_WINDOW = 15 * 60

/** Generates, hashes, and stores a code for the given purpose. Callers own emailing and logging it. */
export const issueVerificationCode = async (
	userId: string,
	purpose: VerificationPurpose
): Promise<string> => {
	const code = generateOtpCode()

	await createVerificationCode({
		userId,
		purpose,
		codeHash: hashVerificationCode(code),
		expiresAt: new Date(Date.now() + VERIFICATION_TTL * 1000)
	})

	return code
}

interface VerifyCodeMessages {
	expired?: string
	invalid?: string
}

export const verifyCode = async (
	userId: string,
	purpose: VerificationPurpose,
	code: string,
	messages: VerifyCodeMessages = {}
): Promise<void> => {
	const verification = await findLatestVerificationCode(userId, purpose)

	if (!verification || verification.expiresAt < new Date()) {
		throw new BadRequestError(messages.expired ?? 'Code expired or not found')
	}

	if (verification.attempts >= VERIFICATION_MAX_ATTEMPTS) {
		throw new BadRequestError('Too many attempts - request a new code')
	}

	if (!verificationCodeMatches(code, verification.codeHash)) {
		await incrementVerificationAttempts(verification.id)

		throw new BadRequestError(messages.invalid ?? 'Invalid code')
	}

	await consumeVerificationCode(verification.id)
}

const issueRegistrationCode = async (userId: string, email: string) => {
	const code = await issueVerificationCode(userId, VerificationPurpose.EMAIL_CONFIRM)

	await enqueueVerificationCode({ email, code })

	extendLogContext({
		event: 'registration_started',
		userId,
		code: isProduction ? undefined : code
	})
}

export const register = async (input: RegisterInput, ip: string) => {
	await verifyCaptcha(input.captchaToken, ip)

	const email = normalizeEmail(input.email)

	if (await isDisposableEmail(email)) {
		throw new BadRequestError('Temporary email addresses are not allowed')
	}

	const emailHash = hashEmail(email)
	const existing = await findUserByEmailHash(emailHash)

	if (existing) {
		if (existing.status === UserStatus.ACTIVE) {
			throw new ConflictError('User already exists')
		}

		const isRecent = Date.now() - existing.createdAt.getTime() < VERIFICATION_TTL * 1000

		if (isRecent) {
			await issueRegistrationCode(existing.id, email)

			return
		}

		await deletePendingUser(existing.id)
	}

	const { cipher, hash } = encryptEmail(email)

	const user = await createPendingUser({
		emailCipher: cipher,
		emailHash: hash,
		passwordHash: await hashPassword(input.password),
		displayName: input.name,
		username: generateUsername()
	})

	await issueRegistrationCode(user.id, email)
}

export const verifyRegister = async (input: VerifyRegisterInput, origin: RequestOrigin) => {
	const email = normalizeEmail(input.email)
	const user = await findUserByEmailHash(hashEmail(email))

	if (!user || user.status !== UserStatus.PENDING) {
		throw new BadRequestError('Verification code expired or registration not found')
	}

	await verifyCode(user.id, VerificationPurpose.EMAIL_CONFIRM, input.code, {
		expired: 'Verification code expired or registration not found',
		invalid: 'Invalid verification code'
	})

	await activateUser(user.id)

	extendLogContext({ event: 'registration_completed', userId: user.id })

	const tokens = await issueTokenPair(user.id, origin)

	return { id: user.id, ...tokens }
}

const loginAttemptKey = (kind: 'email' | 'ip', value: string) => `login_attempts:${kind}:${value}`

const assertNotLockedOut = async (emailHashHex: string, ip: string) => {
	const [emailAttempts, ipAttempts] = await Promise.all([
		redis.get(loginAttemptKey('email', emailHashHex)),
		redis.get(loginAttemptKey('ip', ip))
	])

	if (Number(emailAttempts) >= LOGIN_ATTEMPT_MAX || Number(ipAttempts) >= LOGIN_ATTEMPT_MAX) {
		throw new TooManyRequestsError('Too many login attempts - try again later')
	}
}

const recordLoginAttempt = async (emailHashHex: string, ip: string, success: boolean) => {
	if (success) {
		await Promise.all([
			redis.del(loginAttemptKey('email', emailHashHex)),
			redis.del(loginAttemptKey('ip', ip))
		])

		return
	}

	const pipeline = redis.pipeline()

	pipeline.incr(loginAttemptKey('email', emailHashHex))
	pipeline.expire(loginAttemptKey('email', emailHashHex), LOGIN_ATTEMPT_WINDOW)
	pipeline.incr(loginAttemptKey('ip', ip))
	pipeline.expire(loginAttemptKey('ip', ip), LOGIN_ATTEMPT_WINDOW)

	await pipeline.exec()
}

export const login = async (input: LoginInput, origin: RequestOrigin) => {
	await verifyCaptcha(input.captchaToken, origin.ip)

	const email = normalizeEmail(input.email)
	const emailHash = hashEmail(email)
	const emailHashHex = emailHash.toString('hex')

	await assertNotLockedOut(emailHashHex, origin.ip)

	const user = await findUserByEmailHash(emailHash)
	const passwordHash = user?.passwordCredential?.passwordHash
	const isCorrect = passwordHash ? await verifyPassword(input.password, passwordHash) : false

	if (!user || !isCorrect) {
		await recordLoginAttempt(emailHashHex, origin.ip, false)

		extendLogContext({ event: 'failed_login_attempt' })

		throw new UnauthorizedError('Invalid email or password')
	}

	if (user.status !== UserStatus.ACTIVE) {
		throw new BadRequestError('Please verify your email before logging in')
	}

	await recordLoginAttempt(emailHashHex, origin.ip, true)
	await updateLastLogin(user.id)

	extendLogContext({ event: 'user_logged_in', userId: user.id })

	const tokens = await issueTokenPair(user.id, origin)

	return { id: user.id, ...tokens }
}

export const logout = (userId: string, sessionId: string) => revokeSession(userId, sessionId)

export const getUserEmail = async (userId: string): Promise<string | null> => {
	const cipher = await findEmailCipher(userId)

	return cipher ? decryptEmail(cipher) : null
}

export const forgotPassword = async (input: ForgotPasswordInput, ip: string) => {
	await verifyCaptcha(input.captchaToken, ip)

	const email = normalizeEmail(input.email)
	const user = await findUserByEmailHash(hashEmail(email))

	if (!user || user.status !== UserStatus.ACTIVE || !user.passwordCredential) {
		return
	}

	const code = await issueVerificationCode(user.id, VerificationPurpose.PASSWORD_RESET)

	await enqueuePasswordResetCode({ email, code })

	extendLogContext({
		event: 'password_reset_requested',
		userId: user.id,
		code: isProduction ? undefined : code
	})
}

export const resetPassword = async (input: ResetPasswordInput, origin: RequestOrigin) => {
	const email = normalizeEmail(input.email)
	const user = await findUserByEmailHash(hashEmail(email))

	if (!user || !user.passwordCredential) {
		throw new BadRequestError('Reset code expired or invalid')
	}

	await verifyCode(user.id, VerificationPurpose.PASSWORD_RESET, input.code, {
		expired: 'Reset code expired or invalid',
		invalid: 'Invalid reset code'
	})

	await updatePasswordHash(user.id, await hashPassword(input.newPassword))

	await revokeAllSessions(user.id)

	extendLogContext({ event: 'password_reset_completed', userId: user.id })

	const tokens = await issueTokenPair(user.id, origin)

	return { id: user.id, ...tokens }
}
