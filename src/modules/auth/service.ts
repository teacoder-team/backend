import { authRepository } from './repository'
import type { RegisterSchema, VerifyRegisterSchema } from './schema'
import { logger } from '@/core/logger/pino'
import { randomBytes } from 'node:crypto'
import { hashPassword } from '@/lib/security/hashing'
import { BadRequestError, ConflictError } from '@/core/errors/base'
import { ErrorCode } from '@/core/errors/codes'
import { redis } from '@/core/redis'
import { otpService } from '@/lib/security/otp'

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
		const username = randomBytes(8).toString('hex')
		const passwordHash = await hashPassword(dto.password)

		await redis.set(
			`auth:register:${dto.email.toLowerCase()}`,
			JSON.stringify({ ...dto, passwordHash, code, username }),
			'EX',
			900,
		)

		logger.info(
			{
				email: dto.email,
				code: process.env.NODE_ENV !== 'production' ? code : '******',
			},
			'register_initiated',
		)
	},
	async verifyRegister(dto: VerifyRegisterSchema) {
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

		await redis.del(redisKey)

		logger.info({ userId: user.id }, 'registration_completed')

		return user
	},
}
