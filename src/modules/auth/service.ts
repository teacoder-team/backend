import { createHash, randomBytes, randomUUID } from 'node:crypto'

import { UserStatus, VerificationPurpose } from '@prisma/generated/client'

import { env, isProduction } from '~/config/env'
import { isDisposableEmail } from '~/lib/datasets/disposable-emails'
import {
	BadRequestError,
	ConflictError,
	NotFoundError,
	TooManyRequestsError,
	UnauthorizedError
} from '~/lib/errors'
import { verifyCaptcha } from '~/lib/integrations/captcha'
import { extendLogContext } from '~/lib/logger'
import { redis } from '~/lib/redis'
import { hashPassword, verifyPassword } from '~/lib/security/hash'
import { generateOtpCode } from '~/lib/security/otp'
import { hashVerificationCode, verificationCodeMatches } from '~/lib/security/verification-code'
import { normalizeEmail } from '~/lib/utils/email'
import { generateUsername } from '~/lib/utils/username'
import { enqueueRegistrationNotification } from '~/modules/admin-bot/service'
import type { MfaMethod } from '~/modules/mfa/model'
import { getMfaMethods, verifyMfaCode } from '~/modules/mfa/service'
import type { OAuthIdentity } from '~/modules/oauth/model'
import { attachOAuthAccount } from '~/modules/oauth/service'
import type { RequestOrigin } from '~/modules/session/model'
import { issueTokenPair, revokeAllSessions, revokeSession } from '~/modules/session/service'

import { enqueuePasswordResetLink, enqueueVerificationCode } from './jobs'
import type {
	ForgotPasswordInput,
	LoginInput,
	MfaChallenge,
	MfaChallengeInput,
	MfaConfirmInput,
	MfaTicket,
	RegisterInput,
	ResetPasswordInput,
	SignInOptions,
	SignInResult,
	VerifyCodeMessages,
	VerifyRegisterInput
} from './model'
import {
	activateUser,
	consumeVerificationCode,
	createPendingUser,
	createVerificationCode,
	deletePendingUser,
	findLatestVerificationCode,
	findUserByEmail,
	findUserEmail,
	incrementVerificationAttempts,
	updateLastLogin,
	updatePasswordHash
} from './repository'

export const VERIFICATION_TTL = 15 * 60
const VERIFICATION_MAX_ATTEMPTS = 5

const LOGIN_ATTEMPT_MAX = 5
const LOGIN_ATTEMPT_WINDOW = 15 * 60

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

	const existing = await findUserByEmail(email)

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

	const user = await createPendingUser({
		email,
		passwordHash: await hashPassword(input.password),
		displayName: input.name,
		username: generateUsername()
	})

	await issueRegistrationCode(user.id, email)
}

export const verifyRegister = async (input: VerifyRegisterInput, origin: RequestOrigin) => {
	const email = normalizeEmail(input.email)
	const user = await findUserByEmail(email)

	if (!user || user.status !== UserStatus.PENDING) {
		throw new NotFoundError('Verification code expired or registration not found')
	}

	await verifyCode(user.id, VerificationPurpose.EMAIL_CONFIRM, input.code, {
		expired: 'Verification code expired or registration not found',
		invalid: 'Invalid verification code'
	})

	await activateUser(user.id)

	extendLogContext({ event: 'registration_completed', userId: user.id })

	const tokens = await issueTokenPair(user.id, origin)

	await enqueueRegistrationNotification({ userId: user.id, via: 'EMAIL' })

	return { id: user.id, ...tokens, linkedProvider: null }
}

const emailBucket = (email: string) => createHash('sha256').update(email).digest('hex')

const loginAttemptKeys = (email: string, { ip, visitorId }: RequestOrigin) =>
	[
		`login_attempts:email:${emailBucket(email)}`,
		`login_attempts:ip:${ip}`,
		visitorId && `login_attempts:visitor:${visitorId}`
	].filter((key): key is string => Boolean(key))

const assertNotLockedOut = async (keys: string[]) => {
	const attempts = await redis.mget(keys)

	if (attempts.some((count) => Number(count) >= LOGIN_ATTEMPT_MAX)) {
		throw new TooManyRequestsError('Too many login attempts - try again later')
	}
}

const recordLoginAttempt = async (keys: string[], success: boolean) => {
	if (success) {
		await redis.del(keys)

		return
	}

	const pipeline = redis.pipeline()

	for (const key of keys) {
		pipeline.incr(key)
		pipeline.expire(key, LOGIN_ATTEMPT_WINDOW)
	}

	await pipeline.exec()
}

export const login = async (input: LoginInput, origin: RequestOrigin) => {
	await verifyCaptcha(input.captchaToken, origin.ip)

	const email = normalizeEmail(input.email)
	const attemptKeys = loginAttemptKeys(email, origin)

	await assertNotLockedOut(attemptKeys)

	const user = await findUserByEmail(email)
	const passwordHash = user?.passwordCredential?.passwordHash
	const isCorrect = passwordHash ? await verifyPassword(input.password, passwordHash) : false

	if (!user || !isCorrect) {
		await recordLoginAttempt(attemptKeys, false)

		extendLogContext({ event: 'failed_login_attempt' })

		throw new NotFoundError('Invalid email or password')
	}

	if (user.status !== UserStatus.ACTIVE) {
		throw new BadRequestError('Please verify your email before logging in')
	}

	await recordLoginAttempt(attemptKeys, true)

	extendLogContext({ event: 'user_logged_in', userId: user.id })

	return await completeSignIn(user.id, origin, 'password')
}

export const logout = (userId: string, sessionId: string) => revokeSession(userId, sessionId)

export const getUserEmail = (userId: string): Promise<string | null> => findUserEmail(userId)

export const forgotPassword = async (input: ForgotPasswordInput, ip: string) => {
	await verifyCaptcha(input.captchaToken, ip)

	const email = normalizeEmail(input.email)
	const user = await findUserByEmail(email)

	if (!user || user.status !== UserStatus.ACTIVE || !user.passwordCredential) {
		return
	}

	const token = await issuePasswordResetToken(user.id)
	const url = `${env.APP_URL}/auth/recovery/${token}`

	await enqueuePasswordResetLink({ email, url })

	extendLogContext({
		event: 'password_reset_requested',
		userId: user.id,
		url: isProduction ? undefined : url
	})
}

export const resetPassword = async (input: ResetPasswordInput, origin: RequestOrigin) => {
	const userId = await consumePasswordResetToken(input.token)

	if (!userId) {
		throw new BadRequestError('Reset link expired or invalid')
	}

	await updatePasswordHash(userId, await hashPassword(input.newPassword))

	await revokeAllSessions(userId)

	extendLogContext({ event: 'password_reset_completed', userId })

	return await completeSignIn(userId, origin, 'password_reset')
}

export const completeSignIn = async (
	userId: string,
	origin: RequestOrigin,
	via: string,
	{ link }: SignInOptions = {}
): Promise<SignInResult> => {
	const mfaMethods = await getMfaMethods(userId)

	if (mfaMethods.length > 0) {
		const mfaToken = await openMfaTicket(userId, via, link ?? null)

		extendLogContext({ mfaRequired: true })

		return { mfaRequired: true, mfaToken, mfaMethods, expiresIn: MFA_TICKET_TTL }
	}

	if (link) {
		await attachOAuthAccount(userId, link, true)
	}

	await updateLastLogin(userId)

	const tokens = await issueTokenPair(userId, origin)

	return {
		mfaRequired: false,
		mfaToken: null,
		id: userId,
		...tokens,
		linkedProvider: link?.provider ?? null
	}
}

export const takeTicket = async (mfaToken: string) => {
	const ticket = await readMfaTicket(mfaToken)

	if (!ticket) {
		throw new UnauthorizedError('MFA session expired - sign in again')
	}

	return ticket
}

export const startMfaChallenge = async ({ mfaToken, method }: MfaChallengeInput) => {
	const ticket = await takeTicket(mfaToken)
	const methods = await getMfaMethods(ticket.userId)

	if (!methods.includes(method)) {
		throw new BadRequestError(`MFA method ${method} is not available for this account`)
	}

	if (method === 'WEBAUTHN') {
		throw new BadRequestError(
			'WebAuthn signs its own challenge - use POST /auth/webauthn/login/options with mfaToken'
		)
	}

	const challenge = { id: randomUUID(), method }

	if (!(await setMfaChallenge(mfaToken, ticket, challenge))) {
		throw new UnauthorizedError('MFA session expired - sign in again')
	}

	extendLogContext({ event: 'mfa_challenge_started', userId: ticket.userId, method })

	return { challengeId: challenge.id, message: `Verification code initiated via ${method}` }
}

export const confirmMfa = async (
	{ mfaToken, challengeId, code }: MfaConfirmInput,
	origin: RequestOrigin
) => {
	const ticket = await takeTicket(mfaToken)

	if (ticket.challenge?.id !== challengeId) {
		throw new BadRequestError('Unknown MFA challenge - start a new one')
	}

	await verifyMfaCode(ticket.userId, ticket.challenge.method, code)

	return await completeMfaSignIn(mfaToken, ticket, ticket.challenge.method, origin)
}

export const completeMfaSignIn = async (
	mfaToken: string,
	ticket: MfaTicket,
	method: MfaMethod,
	origin: RequestOrigin
) => {
	if (!(await closeMfaTicket(mfaToken))) {
		throw new UnauthorizedError('MFA session expired - sign in again')
	}

	if (ticket.link) {
		await attachOAuthAccount(ticket.userId, ticket.link, true)
	}

	await updateLastLogin(ticket.userId)

	extendLogContext({
		event: 'mfa_sign_in_completed',
		userId: ticket.userId,
		method,
		via: ticket.via
	})

	const tokens = await issueTokenPair(ticket.userId, origin)

	return { id: ticket.userId, ...tokens, linkedProvider: ticket.link?.provider ?? null }
}

const PASSWORD_RESET_TTL = 30 * 60

const TOKEN_BYTES = 32

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

const tokenKey = (hash: string) => `password-reset:token:${hash}`

const userKey = (userId: string) => `password-reset:user:${userId}`

export const issuePasswordResetToken = async (userId: string) => {
	const token = randomBytes(TOKEN_BYTES).toString('base64url')
	const hash = hashToken(token)

	const previous = await redis.get(userKey(userId))
	const transaction = redis.multi()

	if (previous) {
		transaction.del(tokenKey(previous))
	}

	await transaction
		.set(tokenKey(hash), userId, 'EX', PASSWORD_RESET_TTL)
		.set(userKey(userId), hash, 'EX', PASSWORD_RESET_TTL)
		.exec()

	return token
}

export const consumePasswordResetToken = async (token: string) => {
	const userId = await redis.getdel(tokenKey(hashToken(token)))

	if (!userId) {
		return null
	}

	await redis.del(userKey(userId))

	return userId
}

export const MFA_TICKET_TTL = 5 * 60

const ticketKey = (token: string) =>
	`mfa:ticket:${createHash('sha256').update(token).digest('base64url')}`

const openMfaTicket = async (
	userId: string,
	via: string,
	link: OAuthIdentity | null = null
) => {
	const token = randomBytes(32).toString('base64url')
	const ticket: MfaTicket = { userId, via, challenge: null, link }

	await redis.set(ticketKey(token), JSON.stringify(ticket), 'EX', MFA_TICKET_TTL)

	return token
}

export const readMfaTicket = async (token: string) => {
	const raw = await redis.get(ticketKey(token))

	return raw ? (JSON.parse(raw) as MfaTicket) : null
}

const setMfaChallenge = async (
	token: string,
	ticket: MfaTicket,
	challenge: MfaChallenge
) => {
	const saved = await redis.set(
		ticketKey(token),
		JSON.stringify({ ...ticket, challenge }),
		'KEEPTTL',
		'XX'
	)

	return saved === 'OK'
}

const closeMfaTicket = async (token: string) => (await redis.del(ticketKey(token))) === 1
