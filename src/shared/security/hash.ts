const ARGON2_OPTIONS = {
	algorithm: 'argon2id',
	memoryCost: 65536,
	timeCost: 3,
} as const

export const hashPassword = (password: string): Promise<string> =>
	Bun.password.hash(password, ARGON2_OPTIONS)

export const verifyPassword = (
	password: string,
	storedHash: string,
): Promise<boolean> => Bun.password.verify(password, storedHash)
