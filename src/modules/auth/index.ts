import { getClientIp } from '@/lib/utils/ip'
import { Elysia } from 'elysia'
import { login, register, verifyRegister } from './service'
import {
	AuthResponse,
	LoginPayload,
	RegisterPayload,
	RegisterResponse,
	VerifyRegisterPayload,
} from './model'
import { env } from '@/core/config/env'

export const auth = new Elysia({
	prefix: '/auth',
	tags: ['Auth'],
})
	.model({
		RegisterPayload,
		VerifyRegisterPayload,
		LoginPayload,
		RegisterResponse,
		AuthResponse,
	})
	.post(
		'/register',
		async ({ body }) => {
			await register(body)

			return { message: 'Verification code sent to email' }
		},
		{
			body: 'RegisterPayload',
			response: 'RegisterResponse',
			detail: {
				summary: 'Initialize register',
				description:
					'Start the process of creating a new user account.',
			},
		},
	)
	.post(
		'/verify',
		async ({ body, request, cookie }) => {
			const ip = getClientIp(request.headers)
			const ua = request.headers.get('User-Agent') ?? 'Unknown'

			const { user, token } = await verifyRegister(body, { ip, ua })

			cookie.tc_token.set({
				value: token,
				httpOnly: true,
				maxAge: env.COOKIE_MAX_AGE,
				secure: env.COOKIE_SECURE,
				domain: env.COOKIE_DOMAIN,
				path: '/',
				sameSite: env.COOKIE_SAMESITE,
			})

			return { id: user.id }
		},
		{
			body: 'VerifyRegisterPayload',
			response: 'AuthResponse',
			detail: {
				summary: 'Verify register',
				description: 'Confirm and activate your newly created account.',
			},
		},
	)
	.post(
		'/login',
		async ({ body, request, cookie }) => {
			const ip = getClientIp(request.headers)
			const ua = request.headers.get('User-Agent') ?? 'Unknown'

			const { user, token } = await login(body, { ip, ua })

			cookie.tc_token.set({
				value: token,
				httpOnly: true,
				maxAge: env.COOKIE_MAX_AGE,
				secure: env.COOKIE_SECURE,
				domain: env.COOKIE_DOMAIN,
				path: '/',
				sameSite: env.COOKIE_SAMESITE,
			})

			return { id: user.id }
		},
		{
			body: 'LoginPayload',
			response: 'AuthResponse',
			detail: {
				summary: 'Login with email',
				description: 'Authenticate and start a new session.',
			},
		},
	)
