import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

import { env } from '~/config/env'

import { loadKey, open, seal } from './aes-gcm'

const SECRET_BYTES = 20
const DIGITS = 6
const PERIOD_SECONDS = 30

const DRIFT_STEPS = 1

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

const encryptionKey = loadKey(env.MFA_ENCRYPTION_KEY, 'MFA_ENCRYPTION_KEY')

const base32Encode = (bytes: Buffer) => {
	let bits = 0
	let value = 0
	let output = ''

	for (const byte of bytes) {
		value = (value << 8) | byte
		bits += 8

		while (bits >= 5) {
			output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
			bits -= 5
		}
	}

	if (bits > 0) {
		output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
	}

	return output
}

const base32Decode = (encoded: string) => {
	let bits = 0
	let value = 0
	const bytes: number[] = []

	for (const char of encoded.replace(/=+$/, '').toUpperCase()) {
		const index = BASE32_ALPHABET.indexOf(char)

		if (index === -1) {
			throw new Error('Invalid base32 character')
		}

		value = (value << 5) | index
		bits += 5

		if (bits >= 8) {
			bytes.push((value >>> (bits - 8)) & 255)
			bits -= 8
		}
	}

	return Buffer.from(bytes)
}

export const generateTotpSecret = () => base32Encode(randomBytes(SECRET_BYTES))

export const encryptTotpSecret = (secret: string) => seal(encryptionKey, secret)

export const decryptTotpSecret = (packed: Uint8Array) => open(encryptionKey, packed)

export const totpStep = (at = Date.now()) => Math.floor(at / 1000 / PERIOD_SECONDS)

const hotp = (key: Buffer, counter: number) => {
	const message = Buffer.alloc(8)

	message.writeBigUInt64BE(BigInt(counter))

	const digest = createHmac('sha1', key).update(message).digest()
	const offset = digest[digest.length - 1]! & 0x0f
	const binary = digest.readUInt32BE(offset) & 0x7fffffff

	return (binary % 10 ** DIGITS).toString().padStart(DIGITS, '0')
}

export const isTotpCode = (code: string) => new RegExp(`^\\d{${DIGITS}}$`).test(code)

export const matchTotp = (
	secret: string,
	code: string,
	lastUsedStep: bigint | null,
	at = Date.now()
): number | null => {
	if (!isTotpCode(code)) {
		return null
	}

	const key = base32Decode(secret)
	const current = totpStep(at)
	const provided = Buffer.from(code)

	for (let step = current - DRIFT_STEPS; step <= current + DRIFT_STEPS; step++) {
		if (lastUsedStep !== null && BigInt(step) <= lastUsedStep) {
			continue
		}

		if (timingSafeEqual(Buffer.from(hotp(key, step)), provided)) {
			return step
		}
	}

	return null
}

export interface TotpUriInput {
	secret: string
	issuer: string
	account: string
}

export const buildTotpUri = ({ secret, issuer, account }: TotpUriInput) => {
	const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(account)}`
	const params = new URLSearchParams({
		secret,
		issuer,
		algorithm: 'SHA1',
		digits: String(DIGITS),
		period: String(PERIOD_SECONDS)
	})

	return `otpauth://totp/${label}?${params}`
}
