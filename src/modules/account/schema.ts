import { t } from 'elysia'

export const AccountSchema = {
	create: t.Object({
		name: t.String({
			minLength: 2,
			maxLength: 50,
		}),
		email: t.String({ format: 'email' }),
		password: t.String({ minLength: 6 }),
	}),
}

export type CreateAccountSchema = typeof AccountSchema.create.static
