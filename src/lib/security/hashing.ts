import { logger } from '@/core/logger/pino'

export async function hashPassword(password: string): Promise<string> {
	try {
		return await Bun.password.hash(password, {
			algorithm: 'argon2id',
			memoryCost: 65536,
			timeCost: 3,
		})
	} catch (err) {
		logger.error({ context: 'security', err }, 'password_hashing_failed')
		throw new Error('Failed to secure password')
	}
}

export async function verifyPassword(
	password: string,
	storedHash: string,
): Promise<boolean> {
	try {
		return await Bun.password.verify(password, storedHash)
	} catch (err) {
		logger.error(
			{ context: 'security', err },
			'password_verification_failed',
		)
		return false
	}
}
