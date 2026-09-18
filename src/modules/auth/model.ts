import { type Static, t } from 'elysia'

export const RegisterPayload = t.Object({
	name: t.String({
		minLength: 2,
		maxLength: 50,
		error: 'Name must be between 2 and 50 characters',
		examples: ['Linus Torvalds']
	}),
	email: t.String({
		format: 'email',
		error: 'Invalid email format',
		examples: ['torvalds.l@teacoder.com']
	}),
	password: t.String({
		minLength: 6,
		error: 'Password must be at least 6 characters',
		examples: ['securepassword123']
	})
})

export const VerifyRegisterPayload = t.Object({
	email: t.String({
		format: 'email',
		error: 'Invalid email format',
		examples: ['torvalds.l@teacoder.com']
	}),
	code: t.String({
		minLength: 6,
		maxLength: 6,
		error: 'Verification code must be exactly 6 characters',
		examples: ['123456']
	})
})

export const LoginPayload = t.Object({
	email: t.String({
		format: 'email',
		error: 'Invalid email format',
		examples: ['torvalds.l@teacoder.com']
	}),
	password: t.String({
		minLength: 6,
		error: 'Password is required',
		examples: ['securepassword123']
	})
})

export const ForgotPasswordPayload = t.Object({
	email: t.String({
		format: 'email',
		error: 'Invalid email format',
		examples: ['torvalds.l@teacoder.com']
	})
})

export const ResetPasswordPayload = t.Object({
	email: t.String({
		format: 'email',
		error: 'Invalid email format',
		examples: ['torvalds.l@teacoder.com']
	}),
	code: t.String({
		minLength: 6,
		maxLength: 6,
		error: 'Reset code must be exactly 6 characters',
		examples: ['123456']
	}),
	newPassword: t.String({
		minLength: 6,
		error: 'Password must be at least 6 characters',
		examples: ['newsecurepassword123']
	})
})

export const MessageResponse = t.Object({
	message: t.String({
		description: 'Status message indicating the next step.',
		examples: ['Verification code sent to email']
	})
})

const AccessToken = t.String({
	description: 'Short-lived JWT - send as `Authorization: Bearer <token>`.',
	examples: ['eyJhbGciOiJIUzI1NiJ9...']
})

const RefreshToken = t.String({
	description: 'Long-lived opaque token - exchange it at /auth/refresh for a new pair.',
	examples: ['3f8a1c2e9b7d4a51-8c62-1d4e5f6a7b8c...']
})

export const AuthResponse = t.Object({
	id: t.String({
		description: 'Unique identifier of the authenticated user.',
		examples: ['49003cb8-7f31-4942-abec-ac9e29318681']
	}),
	accessToken: AccessToken,
	refreshToken: RefreshToken
})

export const RefreshPayload = t.Object({
	refreshToken: t.Optional(
		t.String({
			description: 'Only needed when not sending the tc_refresh cookie (bearer clients).'
		})
	)
})

export const TokenPairResponse = t.Object({
	accessToken: AccessToken,
	refreshToken: RefreshToken
})

export type RegisterInput = Static<typeof RegisterPayload>
export type VerifyRegisterInput = Static<typeof VerifyRegisterPayload>
export type LoginInput = Static<typeof LoginPayload>
export type RefreshInput = Static<typeof RefreshPayload>
export type ForgotPasswordInput = Static<typeof ForgotPasswordPayload>
export type ResetPasswordInput = Static<typeof ResetPasswordPayload>
