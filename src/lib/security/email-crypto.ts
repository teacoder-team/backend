import { createHmac } from 'node:crypto'

import { env } from '~/config/env'

import { loadKey, open, seal } from './aes-gcm'

const encryptionKey = loadKey(env.EMAIL_ENCRYPTION_KEY, 'EMAIL_ENCRYPTION_KEY')
const hashKey = loadKey(env.EMAIL_HASH_KEY, 'EMAIL_HASH_KEY')

export interface EncryptedEmail {
	cipher: Buffer
	hash: Buffer
}

export const hashEmail = (email: string): Buffer =>
	createHmac('sha256', hashKey).update(email).digest()

export const encryptEmail = (email: string): EncryptedEmail => ({
	cipher: seal(encryptionKey, email),
	hash: hashEmail(email)
})

export const decryptEmail = (packed: Uint8Array): string => open(encryptionKey, packed)
