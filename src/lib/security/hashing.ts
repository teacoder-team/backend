import * as argon2 from 'argon2'
import { logger } from '@/core/logger/pino'

const ARGON_CONFIG: argon2.Options & { type: 2 } = {
	type: argon2.argon2id,
	memoryCost: 65536,
	timeCost: 3,
	parallelism: 4,
}

export async function hashPassword(password: string): Promise<string> {
	try {
		return await argon2.hash(password, ARGON_CONFIG)
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
		return await argon2.verify(storedHash, password)
	} catch (err) {
		logger.error(
			{ context: 'security', err },
			'password_verification_failed',
		)
		return false
	}
}
