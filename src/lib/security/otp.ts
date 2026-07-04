export function generateOtpCode(): string {
	const array = new Uint32Array(1)
	crypto.getRandomValues(array)

	return (100000 + (array[0] % 900000)).toString()
}

export function verifyOtpCode(provided: string, stored: string): boolean {
	if (provided.length !== stored.length) return false

	return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(stored))
}
