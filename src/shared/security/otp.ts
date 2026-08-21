import { randomInt, timingSafeEqual } from 'node:crypto'

const OTP_LENGTH = 6

export const generateOtpCode = (): string =>
	randomInt(0, 10 ** OTP_LENGTH)
		.toString()
		.padStart(OTP_LENGTH, '0')

export const verifyOtpCode = (provided: string, expected: string): boolean => {
	if (provided.length !== expected.length) return false

	return timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
}
