import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { BadRequestError } from '~/lib/errors'
import { refreshTokenPair } from '~/modules/session/service'
import { authCookie, REFRESH_COOKIE } from '~/plugins/auth-cookie'
import { authGuard } from '~/plugins/auth-guard'
import { requestContext } from '~/plugins/request-context'

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

export const auth = new Elysia({ prefix: '/auth', tags: [TAG.auth] })
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
		async ({ body, ip }) => {
			await register(body, ip)

			return { message: 'Verification code sent to email' }
		},
		{
			body: 'RegisterPayload',
			response: 'MessageResponse',
			detail: {
				summary: 'Регистрация',
				description:
					'Создаёт неподтверждённый аккаунт и отправляет на почту 6-значный код, действующий 15 минут. Повторный запрос для той же почты просто отправит новый код. Требует токен капчи, если она включена.'
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
				summary: 'Подтверждение регистрации',
				description:
					'Проверяет код из письма, активирует аккаунт и сразу выполняет вход: возвращает пару токенов и ставит cookie. На код даётся 5 попыток.'
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
				summary: 'Вход по почте и паролю',
				description:
					'Открывает новую сессию: возвращает пару токенов и ставит cookie. После 5 неудачных попыток вход для этой почты и этого IP блокируется на 15 минут. Требует токен капчи, если она включена.'
			}
		}
	)
	.post(
		'/refresh',
		async ({ body, cookie, authCookie }) => {
			const token = body.refreshToken ?? (cookie[REFRESH_COOKIE]?.value as string | undefined)

			if (!token) {
				throw new BadRequestError('Missing refresh token')
			}

			const tokens = await refreshTokenPair(token)

			authCookie.set(tokens)

			return tokens
		},
		{
			body: 'RefreshPayload',
			response: 'TokenPairResponse',
			detail: {
				summary: 'Обновление токенов',
				description:
					'Обменивает refresh-токен на новую пару. Токен берётся из cookie `tc_refresh` или из тела запроса. Старый refresh-токен после этого недействителен, и его повторное использование считается кражей: вся сессия завершается.'
			}
		}
	)
	.post(
		'/forgot-password',
		async ({ body, ip }) => {
			await forgotPassword(body, ip)

			return { message: 'If that email exists, a reset code has been sent' }
		},
		{
			body: 'ForgotPasswordPayload',
			response: 'MessageResponse',
			detail: {
				summary: 'Запрос сброса пароля',
				description:
					'Отправляет на почту код для сброса пароля. Отвечает одинаково независимо от того, есть ли такой аккаунт, - так нельзя узнать, зарегистрирована ли почта. Требует токен капчи, если она включена.'
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
				summary: 'Сброс пароля',
				description:
					'Проверяет код из письма и устанавливает новый пароль. Все остальные сессии завершаются, а на этом устройстве открывается новая.'
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
				summary: 'Выход',
				description: 'Завершает текущую сессию и удаляет cookie с токенами.',
				security: [{ bearerAuth: [] }]
			}
		}
	)
