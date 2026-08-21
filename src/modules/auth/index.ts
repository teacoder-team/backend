import { Elysia } from 'elysia'

import { authCookie } from '@/plugins/auth-cookie'
import { authGuard } from '@/plugins/auth-guard'
import { requestContext } from '@/plugins/request-context'
import {
	AuthResponse,
	LoginPayload,
	MessageResponse,
	RegisterPayload,
	VerifyRegisterPayload,
} from './model'
import { login, logout, register, verifyRegister } from './service'

export const auth = new Elysia({ prefix: '/auth', tags: ['Auth'] })
	.use(requestContext)
	.use(authCookie)
	.use(authGuard)
	.model({
		RegisterPayload,
		VerifyRegisterPayload,
		LoginPayload,
		MessageResponse,
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
			response: 'MessageResponse',
			detail: {
				summary: 'Initialize register',
				description: 'Start the process of creating a new user account.',
			},
		},
	)
	.post(
		'/verify',
		async ({ body, ip, userAgent, authCookie }) => {
			const { user, token } = await verifyRegister(body, { ip, userAgent })

			authCookie.set(token)

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
		async ({ body, ip, userAgent, authCookie }) => {
			const { user, token } = await login(body, { ip, userAgent })

			authCookie.set(token)

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
	.post(
		'/logout',
		async ({ session, authCookie }) => {
			await logout(session.userId, session.id)

			authCookie.clear()

			return { message: 'Signed out' }
		},
		{
			auth: true,
			response: 'MessageResponse',
			detail: {
				summary: 'Logout',
				description: 'Terminate the current session and clear the cookie.',
				security: [{ bearerAuth: [] }],
			},
		},
	)
