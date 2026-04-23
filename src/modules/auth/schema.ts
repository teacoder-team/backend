import { t } from 'elysia'

export const AuthSchema = {
	register: t.Object({
		name: t.String({
			minLength: 2,
			maxLength: 50,
			error: 'Name must be between 2 and 50 characters',
		}),
		email: t.String({
			format: 'email',
			error: 'Invalid email format',
		}),
		password: t.String({
			minLength: 6,
			error: 'Password must be at least 8 characters long',
		}),
	}),
	verify: t.Object({
		email: t.String({ format: 'email' }),
		code: t.String({
			minLength: 6,
			maxLength: 6,
			error: 'Verification code must be exactly 6 characters',
		}),
	}),
}

export type RegisterSchema = typeof AuthSchema.register.static
export type VerifyRegisterSchema = typeof AuthSchema.verify.static
