import { randomInt, timingSafeEqual } from 'node:crypto'

export const otpService = {
	generateCode(): string {
		return randomInt(100000, 999999).toString()
	},
	verify(provided: string, stored: string): boolean {
		if (provided.length !== stored.length) return false

		return timingSafeEqual(Buffer.from(provided), Buffer.from(stored))
	},
}
