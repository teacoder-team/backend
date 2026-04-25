import { authRepository } from './repository'
import type {
	LoginSchema,
	RegisterSchema,
	VerifyRegisterSchema,
} from './schema'
import { logger } from '@/core/logger/pino'
import { hashPassword, verifyPassword } from '@/lib/security/hashing'
import { BadRequestError, ConflictError } from '@/core/errors/base'
import { ErrorCode } from '@/core/errors/codes'
import { redis } from '@/core/redis'
import { otpService } from '@/lib/security/otp'
import VerificationEmail from '../../../emails/templates/VerificationCode'
import { mailClient } from '@/core/mail/client'
import { render } from '@react-email/components'
import { sessionService } from '../session/service'
import { env } from '@/core/config/env'

export const authService = {
	async register(dto: RegisterSchema) {
		const isEmailTaken = await authRepository.exists(dto.email)

		if (isEmailTaken) {
			logger.warn(
				{ email: dto.email },
				'attempt_to_register_existing_email',
			)

			throw new ConflictError(
				ErrorCode.EMAIL_ALREADY_EXISTS,
				'User already exists',
			)
		}

		const code = otpService.generateCode()
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

		const html = await render(VerificationEmail({ code }))

		mailClient
			.send({
				to: dto.email,
				subject: `${code} - код подтверждения TeaCoder`,
				html,
				sender: 'hello',
			})
			.catch((err) => {
				logger.error(
					{ err, email: dto.email },
					'failed_to_send_registration_email',
				)
			})

		logger.info(
			{
				email: dto.email,
				code: env.NODE_ENV !== 'production' ? code : '******',
			},
			'register_initiated',
		)
	},
	async verifyRegister(
		dto: VerifyRegisterSchema,
		metadata: { ip: string; ua: string },
	) {
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
		const isCodeValid = otpService.verify(dto.code, pendingUser.code)

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

		const user = await authRepository.create({
			email: pendingUser.email,
			password: pendingUser.passwordHash,
			displayName: pendingUser.name,
			username: pendingUser.username,
		})

		const session = await sessionService.create({
			userId: user.id,
			ip: metadata.ip,
			userAgent: metadata.ua,
		})

		await redis.del(redisKey)

		logger.info(
			{ userId: user.id, sessionId: session.id },
			'registration_completed',
		)

		return { user, sessionId: session.id }
	},
	async login(dto: LoginSchema, metadata: { ip: string; ua: string }) {
		const user = await authRepository.findByEmail(dto.email)

		if (!user) {
			throw new BadRequestError(
				ErrorCode.INVALID_CREDENTIALS,
				'Invalid email or password',
			)
		}

		const isPasswordCorrect = await verifyPassword(
			dto.password,
			user.password!,
		)

		if (!isPasswordCorrect) {
			logger.warn({ email: dto.email }, 'failed_login_attempt')
			throw new BadRequestError(
				ErrorCode.INVALID_CREDENTIALS,
				'Invalid email or password',
			)
		}

		const session = await sessionService.create({
			userId: user.id,
			ip: metadata.ip,
			userAgent: metadata.ua,
		})

		logger.info(
			{ userId: user.id, sessionId: session.id },
			'user_logged_in',
		)

		return { user, sessionId: session.id }
	},
}
