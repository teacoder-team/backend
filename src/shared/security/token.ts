import { createHmac, timingSafeEqual } from 'node:crypto'

import { env } from '@/config/env'
import { ErrorCode, UnauthorizedError } from '@/shared/errors'

const TOKEN_PREFIX = 'tc'

export interface TokenPayload {
	/** Session id. */
	sid: string
	/** User id. */
	sub: string
}

const sign = (encodedPayload: string) =>
	createHmac('sha256', env.TOKEN_SECRET).update(encodedPayload).digest('hex')

export const signToken = (payload: TokenPayload): string => {
	const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
		'base64url',
	)

	return `${TOKEN_PREFIX}_${encodedPayload}.${sign(encodedPayload)}`
}

export const verifyToken = (token: string): TokenPayload => {
	try {
		if (!token.startsWith(`${TOKEN_PREFIX}_`)) {
			throw new Error('Invalid token prefix')
		}

		const [encodedPayload, signature] = token
			.slice(TOKEN_PREFIX.length + 1)
			.split('.')

		if (!encodedPayload || !signature) {
			throw new Error('Malformed token structure')
		}

		// Throws on a length mismatch, which `catch` turns into a 401 anyway.
		const isValid = timingSafeEqual(
			Buffer.from(signature, 'hex'),
			Buffer.from(sign(encodedPayload), 'hex'),
		)

		if (!isValid) throw new Error('Signature mismatch')

		return JSON.parse(
			Buffer.from(encodedPayload, 'base64url').toString('utf8'),
		) as TokenPayload
	} catch {
		throw new UnauthorizedError(
			'Invalid or corrupted authentication token',
			ErrorCode.NOT_AUTHORIZED,
		)
	}
}
