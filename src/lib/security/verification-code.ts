import { createHmac, timingSafeEqual } from 'node:crypto'

import { env } from '~/config/env'

const hashKey = Buffer.from(env.VERIFICATION_CODE_HASH_KEY, 'base64')

if (hashKey.length !== 32) {
	throw new Error('VERIFICATION_CODE_HASH_KEY must decode to exactly 32 bytes')
}

export const hashVerificationCode = (code: string): Buffer =>
	createHmac('sha256', hashKey).update(code).digest()

export const verificationCodeMatches = (provided: string, expectedHash: Uint8Array): boolean => {
	const providedHash = hashVerificationCode(provided)

	return (
		providedHash.length === expectedHash.length &&
		timingSafeEqual(providedHash, Buffer.from(expectedHash))
	)
}
