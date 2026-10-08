import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

export const loadKey = (base64: string, name: string) => {
	const key = Buffer.from(base64, 'base64')

	if (key.length !== 32) {
		throw new Error(`${name} must decode to exactly 32 bytes`)
	}

	return key
}

/** Packed as iv | authTag | ciphertext. */
export const seal = (key: Buffer, plaintext: string): Buffer => {
	const iv = randomBytes(IV_LENGTH)
	const cipher = createCipheriv(ALGORITHM, key, iv)

	const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])

	return Buffer.concat([iv, cipher.getAuthTag(), ciphertext])
}

export const open = (key: Buffer, packed: Uint8Array): string => {
	const buffer = Buffer.from(packed.buffer, packed.byteOffset, packed.byteLength)
	const iv = buffer.subarray(0, IV_LENGTH)
	const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH)
	const ciphertext = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

	const decipher = createDecipheriv(ALGORITHM, key, iv)

	decipher.setAuthTag(authTag)

	return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}
