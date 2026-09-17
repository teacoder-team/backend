import { isProduction } from '~/config/env'
import { isDisposableEmail } from '~/infra/datasets/disposable-emails'
import { extendLogContext } from '~/infra/logger'
import { redis } from '~/infra/redis'
import { issueSession, type RequestOrigin, revokeSession } from '~/modules/session/service'
import { normalizeEmail } from '~/shared/email'
import { BadRequestError, ConflictError, UnauthorizedError } from '~/shared/errors'
import { hashPassword, verifyPassword } from '~/shared/security/hash'
import { generateOtpCode, verifyOtpCode } from '~/shared/security/otp'
import { generateUsername } from '~/shared/username'

import { enqueueVerificationCode } from './jobs'
import type { LoginInput, RegisterInput, VerifyRegisterInput } from './model'
import { createUser, emailExists, findCredentialByEmail } from './repository'

const PENDING_TTL = 15 * 60

interface PendingRegistration {
	email: string
	displayName: string
	username: string
	passwordHash: string
	code: string
}

export const register = async (input: RegisterInput) => {
	const email = normalizeEmail(input.email)

	if (await isDisposableEmail(email)) {
		throw new BadRequestError('Temporary email addresses are not allowed')
	}

	if (await emailExists(email)) {
		throw new ConflictError('User already exists')
	}

	const code = generateOtpCode()

	const pending: PendingRegistration = {
		email,
		displayName: input.name,
		username: generateUsername(),
		passwordHash: await hashPassword(input.password),
		code
	}

	await redis.set(`auth:pending:${email}`, JSON.stringify(pending), 'EX', PENDING_TTL)

	await enqueueVerificationCode({ email, code })

	extendLogContext({
		event: 'registration_started',
		email,
		code: isProduction ? undefined : code
	})
}

export const verifyRegister = async (input: VerifyRegisterInput, origin: RequestOrigin) => {
	const email = normalizeEmail(input.email)
	const raw = await redis.get(`auth:pending:${email}`)

	if (!raw) {
		throw new BadRequestError('Verification code expired or registration not found')
	}

	const pending = JSON.parse(raw) as PendingRegistration

	if (!verifyOtpCode(input.code, pending.code)) {
		throw new BadRequestError('Invalid verification code')
	}

	const user = await createUser({
		email: pending.email,
		passwordHash: pending.passwordHash,
		displayName: pending.displayName,
		username: pending.username
	})

	await redis.del(`auth:pending:${email}`)

	extendLogContext({ event: 'registration_completed', userId: user.id })

	return { user, token: await issueSession(user.id, origin) }
}

export const login = async (input: LoginInput, origin: RequestOrigin) => {
	const email = normalizeEmail(input.email)
	const credential = await findCredentialByEmail(email)

	if (!credential?.passwordHash) throw new UnauthorizedError('Invalid email or password')

	const isCorrect = await verifyPassword(input.password, credential.passwordHash.hash)

	if (!isCorrect) {
		extendLogContext({ event: 'failed_login_attempt', email })

		throw new UnauthorizedError('Invalid email or password')
	}

	const { user } = credential

	extendLogContext({ event: 'user_logged_in', userId: user.id })

	return { user, token: await issueSession(user.id, origin) }
}

export const logout = (userId: string, sessionId: string) => revokeSession(userId, sessionId)
