import { t } from 'elysia'

export const PrismaEnum = <const T extends Record<string, string>>(
	values: T,
	options?: Parameters<typeof t.UnionEnum>[1]
) => {
	const allowed = Object.values(values) as [T[keyof T], ...T[keyof T][]]

	return t.UnionEnum(allowed, {
		error: `Expected one of: ${allowed.join(', ')}`,
		...options
	})
}
