import { createHash, randomBytes } from 'node:crypto'

const TOKEN_BYTES = 32

export interface GeneratedRefreshToken {
	token: string
	hash: Buffer
}

/** Unkeyed SHA-256 is fine here - the token is already high-entropy random data. */
export const hashRefreshToken = (token: string): Buffer =>
	createHash('sha256').update(token).digest()

export const generateRefreshToken = (): GeneratedRefreshToken => {
	const token = randomBytes(TOKEN_BYTES).toString('base64url')

	return { token, hash: hashRefreshToken(token) }
}
