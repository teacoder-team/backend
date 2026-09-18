import { randomInt } from 'node:crypto'

const OTP_LENGTH = 6

export const generateOtpCode = (): string =>
	randomInt(0, 10 ** OTP_LENGTH)
		.toString()
		.padStart(OTP_LENGTH, '0')
