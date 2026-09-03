import { t, type Static } from 'elysia'

import { ApiResponse } from '@/shared/api'

export const RegisterPayload = t.Object({
	name: t.String({
		minLength: 2,
		maxLength: 50,
		error: 'Name must be between 2 and 50 characters',
		examples: ['Linus Torvalds'],
	}),
	email: t.String({
		format: 'email',
		error: 'Invalid email format',
		examples: ['torvalds.l@teacoder.com'],
	}),
	password: t.String({
		minLength: 6,
		error: 'Password must be at least 6 characters',
		examples: ['securepassword123'],
	}),
})

export const VerifyRegisterPayload = t.Object({
	email: t.String({
		format: 'email',
		error: 'Invalid email format',
		examples: ['torvalds.l@teacoder.com'],
	}),
	code: t.String({
		minLength: 6,
		maxLength: 6,
		error: 'Verification code must be exactly 6 characters',
		examples: ['123456'],
	}),
})

export const LoginPayload = t.Object({
	email: t.String({
		format: 'email',
		error: 'Invalid email format',
		examples: ['torvalds.l@teacoder.com'],
	}),
	password: t.String({
		minLength: 6,
		error: 'Password is required',
		examples: ['securepassword123'],
	}),
})

const MessageResult = t.Object({
	message: t.String({
		description: 'Status message indicating the next step.',
		examples: ['Verification code sent to email'],
	}),
})

const AuthResult = t.Object({
	id: t.String({
		description: 'Unique identifier of the authenticated user.',
		examples: ['49003cb8-7f31-4942-abec-ac9e29318681'],
	}),
})

export const MessageResponse = ApiResponse(MessageResult)
export const AuthResponse = ApiResponse(AuthResult)

export type RegisterInput = Static<typeof RegisterPayload>
export type VerifyRegisterInput = Static<typeof VerifyRegisterPayload>
export type LoginInput = Static<typeof LoginPayload>
