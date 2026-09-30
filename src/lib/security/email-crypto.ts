import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto'

import { env } from '~/config/env'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

const encryptionKey = Buffer.from(env.EMAIL_ENCRYPTION_KEY, 'base64')
const hashKey = Buffer.from(env.EMAIL_HASH_KEY, 'base64')

if (encryptionKey.length !== 32) {
	throw new Error('EMAIL_ENCRYPTION_KEY must decode to exactly 32 bytes')
}

if (hashKey.length !== 32) {
	throw new Error('EMAIL_HASH_KEY must decode to exactly 32 bytes')
}

export interface EncryptedEmail {
	cipher: Buffer
	hash: Buffer
}

export const hashEmail = (email: string): Buffer =>
	createHmac('sha256', hashKey).update(email).digest()

export const encryptEmail = (email: string): EncryptedEmail => {
	const iv = randomBytes(IV_LENGTH)
	const cipher = createCipheriv(ALGORITHM, encryptionKey, iv)

	const ciphertext = Buffer.concat([cipher.update(email, 'utf8'), cipher.final()])
	const authTag = cipher.getAuthTag()

	return {
		cipher: Buffer.concat([iv, authTag, ciphertext]),
		hash: hashEmail(email)
	}
}

export const decryptEmail = (packed: Uint8Array): string => {
	const buffer = Buffer.from(packed.buffer, packed.byteOffset, packed.byteLength)
	const iv = buffer.subarray(0, IV_LENGTH)
	const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
	const ciphertext = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

	const decipher = createDecipheriv(ALGORITHM, encryptionKey, iv)
	decipher.setAuthTag(authTag)

	return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}
