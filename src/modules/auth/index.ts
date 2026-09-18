import { Elysia } from 'elysia'

import { refreshTokenPair } from '~/modules/session/service'
import { authCookie, REFRESH_COOKIE } from '~/plugins/auth-cookie'
import { authGuard } from '~/plugins/auth-guard'
import { requestContext } from '~/plugins/request-context'
import { BadRequestError } from '~/shared/errors'

import {
	AuthResponse,
	ForgotPasswordPayload,
	LoginPayload,
	MessageResponse,
	RefreshPayload,
	RegisterPayload,
	ResetPasswordPayload,
	TokenPairResponse,
	VerifyRegisterPayload
} from './model'
import { forgotPassword, login, logout, register, resetPassword, verifyRegister } from './service'

export const auth = new Elysia({ prefix: '/auth', tags: ['Auth'] })
	.use(requestContext)
	.use(authCookie)
	.use(authGuard)
	.model({
		RegisterPayload,
		VerifyRegisterPayload,
		LoginPayload,
		RefreshPayload,
		ForgotPasswordPayload,
		ResetPasswordPayload,
		MessageResponse,
		AuthResponse,
		TokenPairResponse
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
				description: 'Start the process of creating a new user account.'
			}
		}
	)
	.post(
		'/verify',
		async ({ body, ip, userAgent, authCookie }) => {
			const result = await verifyRegister(body, { ip, userAgent })

			authCookie.set(result)

			return result
		},
		{
			body: 'VerifyRegisterPayload',
			response: 'AuthResponse',
			detail: {
				summary: 'Verify register',
				description: 'Confirm and activate your newly created account.'
			}
		}
	)
	.post(
		'/login',
		async ({ body, ip, userAgent, authCookie }) => {
			const result = await login(body, { ip, userAgent })

			authCookie.set(result)

			return result
		},
		{
			body: 'LoginPayload',
			response: 'AuthResponse',
			detail: {
				summary: 'Login with email',
				description: 'Authenticate and start a new session.'
			}
		}
	)
	.post(
		'/refresh',
		async ({ body, cookie, authCookie }) => {
			const token = body.refreshToken ?? (cookie[REFRESH_COOKIE]?.value as string | undefined)

			if (!token) throw new BadRequestError('Missing refresh token')

			const tokens = await refreshTokenPair(token)

			authCookie.set(tokens)

			return tokens
		},
		{
			body: 'RefreshPayload',
			response: 'TokenPairResponse',
			detail: {
				summary: 'Refresh tokens',
				description:
					'Rotates the refresh token and issues a new access token. Reusing an already-rotated refresh token revokes the whole session.'
			}
		}
	)
	.post(
		'/forgot-password',
		async ({ body }) => {
			await forgotPassword(body)

			return { message: 'If that email exists, a reset code has been sent' }
		},
		{
			body: 'ForgotPasswordPayload',
			response: 'MessageResponse',
			detail: {
				summary: 'Request a password reset code',
				description:
					'Always responds the same way, whether or not the email is registered - avoids leaking account existence.'
			}
		}
	)
	.post(
		'/reset-password',
		async ({ body, ip, userAgent, authCookie }) => {
			const result = await resetPassword(body, { ip, userAgent })

			authCookie.set(result)

			return result
		},
		{
			body: 'ResetPasswordPayload',
			response: 'AuthResponse',
			detail: {
				summary: 'Reset password',
				description:
					'Confirms the reset code, sets the new password, signs out every other session, and starts a fresh one.'
			}
		}
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
				security: [{ bearerAuth: [] }]
			}
		}
	)
