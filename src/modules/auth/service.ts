import { findByEmail, exists, createAuthUser } from './repository'
import type { LoginInput, RegisterInput, VerifyRegisterInput } from './model'
import { logger } from '@/core/logger/pino'
import { hashPassword, verifyPassword } from '@/lib/security/hashing'
import { BadRequestError, ConflictError } from '@/core/errors/base'
import { ErrorCode } from '@/core/errors/codes'
import { redis } from '@/core/redis'
import VerificationEmail from '../../../emails/templates/VerificationCode'
import { mailClient } from '@/core/mail/client'
import { render } from '@react-email/components'
import { env } from '@/core/config/env'
import { isDisposableEmail } from '@/core/providers/email-check'
import { generateOtpCode, verifyOtpCode } from '@/lib/security/otp'
import { createSession } from '@/lib/security/session'
import { signToken } from '@/lib/security/token'

export async function register(dto: RegisterInput) {
	try {
		const isDisposable = isDisposableEmail(dto.email)

		if (isDisposable) {
			logger.warn(
				{ email: dto.email, reason: 'disposable' },
				'registration_blocked_by_safety_check',
			)

			throw new BadRequestError(
				'Temporary email addresses are not allowed',
			)
		}

		const isEmailTaken = await exists(dto.email)

		if (isEmailTaken) {
			logger.warn(
				{ email: dto.email },
				'attempt_to_register_existing_email',
			)
			throw new ConflictError('User already exists')
		}

		const code = generateOtpCode()
		const username = Buffer.from(
			crypto.getRandomValues(new Uint8Array(8)),
		).toString('hex')
		const passwordHash = await hashPassword(dto.password)

		await redis.set(
			`auth:register:${dto.email.toLowerCase()}`,
			JSON.stringify({ ...dto, passwordHash, code, username }),
			'EX',
			900,
		)

		// const html = await render(VerificationEmail({ code }))

		// await mailClient
		// 	.send({
		// 		to: dto.email,
		// 		subject: `${code} - код подтверждения TeaCoder`,
		// 		html,
		// 		sender: 'hello',
		// 	})
		// 	.catch((err) => {
		// 		logger.error(
		// 			{ err, email: dto.email },
		// 			'failed_to_send_registration_email',
		// 		)
		// 	})

		logger.info(
			{
				email: dto.email,
				code: env.NODE_ENV !== 'production' ? code : '******',
			},
			'register_initiated',
		)
	} catch (err) {
		logger.error({ err }, 'register failed')
		throw err
	}
}

export async function verifyRegister(
	dto: VerifyRegisterInput,
	metadata: { ip: string; ua: string },
) {
	try {
		const redisKey = `auth:register:${dto.email.toLowerCase()}`
		const rawData = await redis.get(redisKey)

		if (!rawData) {
			logger.warn(
				{ email: dto.email },
				'registration_expired_or_not_found',
			)
			throw new BadRequestError(
				ErrorCode.VERIFICATION_CODE_EXPIRED,
				'Verification code expired or session not found',
			)
		}

		const pendingUser = JSON.parse(rawData)
		const isCodeValid = verifyOtpCode(dto.code, pendingUser.code)

		if (!isCodeValid) {
			logger.warn(
				{ email: dto.email, attempt: dto.code },
				'invalid_registration_code',
			)
			throw new BadRequestError(
				ErrorCode.VERIFICATION_CODE_INVALID,
				'Invalid verification code',
			)
		}

		const user = await createAuthUser({
			email: pendingUser.email,
			passwordHash: pendingUser.passwordHash,
			displayName: pendingUser.name,
			username: pendingUser.username,
		})

		const session = await createSession({
			userId: user.id,
			ip: metadata.ip,
			userAgent: metadata.ua,
		})

		const token = signToken({
			sid: session.id,
			sub: user.id,
		})

		await redis.del(redisKey)

		logger.info(
			{ userId: user.id, sessionId: session.id },
			'registration_completed',
		)

		return { user, token }
	} catch (err) {
		logger.error({ err }, 'verifyRegister failed')
		throw err
	}
}

export async function login(
	dto: LoginInput,
	metadata: { ip: string; ua: string },
) {
	try {
		const credential = await findByEmail(dto.email)

		if (!credential || !credential.passwordHash) {
			throw new BadRequestError(
				ErrorCode.INVALID_CREDENTIALS,
				'Invalid email or password',
			)
		}

		const isPasswordCorrect = await verifyPassword(
			dto.password,
			credential.passwordHash.hash,
		)

		if (!isPasswordCorrect) {
			logger.warn({ email: dto.email }, 'failed_login_attempt')
			throw new BadRequestError(
				ErrorCode.INVALID_CREDENTIALS,
				'Invalid email or password',
			)
		}

		const session = await createSession({
			userId: credential.user.id,
			ip: metadata.ip,
			userAgent: metadata.ua,
		})

		const token = signToken({
			sid: session.id,
			sub: credential.user.id,
		})

		logger.info(
			{ userId: credential.user.id, sessionId: session.id },
			'user_logged_in',
		)

		return { user: credential.user, token }
	} catch (err) {
		logger.error({ err }, 'login failed')
		throw err
	}
}
