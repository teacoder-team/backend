import { randomBytes } from 'node:crypto'

import { isProduction } from '@/config/env'
import { isDisposableEmail } from '@/infra/datasets/disposable-emails'
import { logger } from '@/infra/logger'
import { redis } from '@/infra/redis'
import { createSession, revokeSession } from '@/modules/session/service'
import { normalizeEmail } from '@/shared/email'
import {
	BadRequestError,
	ConflictError,
	ErrorCode,
	UnauthorizedError,
} from '@/shared/errors'
import { hashPassword, verifyPassword } from '@/shared/security/hash'
import { generateOtpCode, verifyOtpCode } from '@/shared/security/otp'
import { signToken } from '@/shared/security/token'
import { enqueueVerificationCode } from './jobs'
import type { LoginInput, RegisterInput, VerifyRegisterInput } from './model'
import { createUser, emailExists, findCredentialByEmail } from './repository'

const PENDING_TTL = 15 * 60
const USERNAME_BYTES = 8

interface PendingRegistration {
	email: string
	displayName: string
	username: string
	passwordHash: string
	code: string
}

const pendingKey = (email: string) => `auth:pending:${email}`
const generateUsername = () => randomBytes(USERNAME_BYTES).toString('hex')

export interface RequestOrigin {
	ip: string
	userAgent: string
}

const issueSession = async (userId: string, origin: RequestOrigin) => {
	const session = await createSession({ userId, ...origin })

	return signToken({ sid: session.id, sub: userId })
}

export const register = async (input: RegisterInput) => {
	const email = normalizeEmail(input.email)

	if (await isDisposableEmail(email)) {
		throw new BadRequestError(
			'Temporary email addresses are not allowed',
			ErrorCode.DISPOSABLE_EMAIL,
		)
	}

	if (await emailExists(email)) {
		throw new ConflictError(
			'User already exists',
			ErrorCode.EMAIL_ALREADY_EXISTS,
		)
	}

	const code = generateOtpCode()

	const pending: PendingRegistration = {
		email,
		displayName: input.name,
		username: generateUsername(),
		passwordHash: await hashPassword(input.password),
		code,
	}

	await redis.set(
		pendingKey(email),
		JSON.stringify(pending),
		'EX',
		PENDING_TTL,
	)

	await enqueueVerificationCode({ email, code })

	logger.info(
		{ email, code: isProduction ? undefined : code },
		'registration_started',
	)
}

export const verifyRegister = async (
	input: VerifyRegisterInput,
	origin: RequestOrigin,
) => {
	const email = normalizeEmail(input.email)
	const raw = await redis.get(pendingKey(email))

	if (!raw) {
		throw new BadRequestError(
			'Verification code expired or registration not found',
			ErrorCode.VERIFICATION_CODE_EXPIRED,
		)
	}

	const pending = JSON.parse(raw) as PendingRegistration

	if (!verifyOtpCode(input.code, pending.code)) {
		throw new BadRequestError(
			'Invalid verification code',
			ErrorCode.VERIFICATION_CODE_INVALID,
		)
	}

	const user = await createUser({
		email: pending.email,
		passwordHash: pending.passwordHash,
		displayName: pending.displayName,
		username: pending.username,
	})

	await redis.del(pendingKey(email))

	logger.info({ userId: user.id }, 'registration_completed')

	return { user, token: await issueSession(user.id, origin) }
}

export const login = async (input: LoginInput, origin: RequestOrigin) => {
	const email = normalizeEmail(input.email)
	const credential = await findCredentialByEmail(email)

	if (!credential?.passwordHash)
		throw new UnauthorizedError(
			'Invalid email or password',
			ErrorCode.INVALID_CREDENTIALS,
		)

	const isCorrect = await verifyPassword(
		input.password,
		credential.passwordHash.hash,
	)

	if (!isCorrect) {
		logger.warn({ email }, 'failed_login_attempt')

		throw new UnauthorizedError(
			'Invalid email or password',
			ErrorCode.INVALID_CREDENTIALS,
		)
	}

	const { user } = credential

	logger.info({ userId: user.id }, 'user_logged_in')

	return { user, token: await issueSession(user.id, origin) }
}

export const logout = (userId: string, sessionId: string) =>
	revokeSession(userId, sessionId)
