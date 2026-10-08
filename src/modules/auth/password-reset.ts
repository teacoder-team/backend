import { createHash, randomBytes } from 'node:crypto'

import { redis } from '~/lib/redis'

export const PASSWORD_RESET_TTL = 30 * 60

const TOKEN_BYTES = 32

/** Unkeyed SHA-256 is fine here - the token is already high-entropy random data. */
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

const tokenKey = (hash: string) => `password-reset:token:${hash}`

const userKey = (userId: string) => `password-reset:user:${userId}`

/** Only the latest link works: issuing a new one drops the previous token. */
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

/** Single use: the token is gone after the first call, whatever happens next. */
export const consumePasswordResetToken = async (token: string) => {
	const userId = await redis.getdel(tokenKey(hashToken(token)))

	if (!userId) {
		return null
	}

	await redis.del(userKey(userId))

	return userId
}
