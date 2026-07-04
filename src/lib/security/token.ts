import { env } from '@/core/config/env'
import { AppError } from '@/core/errors/base'
import { ErrorCode } from '@/core/errors/codes'
import crypto from 'node:crypto'

const TOKEN_PREFIX = 'tc'

interface TokenPayload {
	sid: string
	sub: string
}

const base64url = {
	encode: (str: string) => Buffer.from(str).toString('base64url'),
	decode: (str: string) => Buffer.from(str, 'base64url').toString('utf8'),
}

export function generateRandomBytes(length = 32): string {
	const bytes = new Uint8Array(length)
	crypto.getRandomValues(bytes)

	return Buffer.from(bytes).toString('hex')
}

export function signToken(payload: TokenPayload): string {
	const rawPayload = JSON.stringify(payload)
	const encodedPayload = base64url.encode(rawPayload)

	const signature = crypto
		.createHmac('sha256', env.TOKEN_SECRET)
		.update(encodedPayload)
		.digest('hex')

	return `${TOKEN_PREFIX}_${encodedPayload}.${signature}`
}

export function verifyToken(token: string): TokenPayload {
	try {
		if (!token.startsWith(`${TOKEN_PREFIX}_`)) {
			throw new Error('Invalid token prefix')
		}

		const cleanToken = token.substring(TOKEN_PREFIX.length + 1)
		const [encodedPayload, providedSignature] = cleanToken.split('.')

		if (!encodedPayload || !providedSignature) {
			throw new Error('Malformed token structure')
		}

		const expectedSignature = crypto
			.createHmac('sha256', env.TOKEN_SECRET)
			.update(encodedPayload)
			.digest('hex')

		const isSignatureValid = crypto.timingSafeEqual(
			Buffer.from(providedSignature, 'hex'),
			Buffer.from(expectedSignature, 'hex'),
		)

		if (!isSignatureValid) {
			throw new Error('Signature mismatch')
		}

		const rawPayload = base64url.decode(encodedPayload)
		return JSON.parse(rawPayload) as TokenPayload
	} catch (err) {
		throw new AppError(
			ErrorCode.NOT_AUTHORIZED,
			401,
			'Invalid or corrupted authentication token',
		)
	}
}
