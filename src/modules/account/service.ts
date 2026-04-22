import { accountRepository } from './repository'
import type { CreateAccountSchema } from './schema'
import { logger } from '@/core/logger/pino'
import { randomBytes } from 'node:crypto'
import { hashPassword } from '@/lib/security/hashing'
import { ConflictError } from '@/core/errors/base'
import { ErrorCode } from '@/core/errors/codes'

export const accountService = {
	async register(dto: CreateAccountSchema) {
		const isEmailTaken = await accountRepository.exists(dto.email)

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

		const username = randomBytes(8).toString('hex')
		const passwordHash = await hashPassword(dto.password)

		const user = await accountRepository.create({
			displayName: dto.name,
			username,
			email: dto.email,
			password: passwordHash,
		})

		logger.info({ userId: user.id }, 'user_successfully_registered')

		const { password: _, ...safeUser } = user

		return safeUser
	},
}
