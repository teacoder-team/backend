import { t } from 'elysia'

/** A TypeBox union of a Prisma enum's values, with a readable error listing them. */
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
