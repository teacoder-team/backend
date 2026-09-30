import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { BadRequestError } from '~/lib/errors'
import { refreshTokenPair } from '~/modules/session/service'
import { authCookie } from '~/plugins/auth-cookie'
import { authGuard } from '~/plugins/auth-guard'
import { fingerprint } from '~/plugins/fingerprint'
import { requestContext } from '~/plugins/request-context'

import {
	AccessTokenResponse,
	AuthResponse,
	ForgotPasswordPayload,
	LoginPayload,
	MessageResponse,
	MfaChallengePayload,
	MfaChallengeResponse,
	MfaConfirmPayload,
	RegisterPayload,
	ResetPasswordPayload,
	SignInResponse,
	VerifyRegisterPayload
} from './model'
import {
	confirmMfa,
	forgotPassword,
	login,
	logout,
	register,
	resetPassword,
	startMfaChallenge,
	verifyRegister
} from './service'

export const auth = new Elysia({ prefix: '/auth', tags: [TAG.auth] })
	.use(requestContext)
	.use(authCookie)
	.use(authGuard)
	.use(fingerprint)
	.model({
		RegisterPayload,
		VerifyRegisterPayload,
		LoginPayload,
		ForgotPasswordPayload,
		ResetPasswordPayload,
		MessageResponse,
		AuthResponse,
		SignInResponse,
		MfaChallengePayload,
		MfaChallengeResponse,
		MfaConfirmPayload,
		AccessTokenResponse
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
		async ({ body, ip, userAgent, visitorId, authCookie }) => {
			const result = await verifyRegister(body, { ip, userAgent, visitorId })

			return authCookie.issue(result)
		},
		{
			body: 'VerifyRegisterPayload',
			fingerprint: true,
			response: 'AuthResponse',
			detail: {
				summary: 'Подтверждение регистрации',
				description:
					'Проверяет код из письма, активирует аккаунт и сразу выполняет вход: access-токен в теле, refresh-токен в httpOnly-cookie `tc_refresh`. На код даётся 5 попыток.'
			}
		}
	)
	.post(
		'/login',
		async ({ body, ip, userAgent, visitorId, authCookie }) => {
			const result = await login(body, { ip, userAgent, visitorId })

			if (result.mfaRequired) {
				return result
			}

			return authCookie.issue(result)
		},
		{
			body: 'LoginPayload',
			fingerprint: true,
			response: 'SignInResponse',
			detail: {
				summary: 'Вход по почте и паролю',
				description:
					'Проверяет пароль. Если двухфакторная защита выключена - открывает сессию: access-токен в теле, refresh-токен в httpOnly-cookie `tc_refresh`. Если включена - сессия не создаётся: в ответе `mfaRequired: true` и `mfaToken` для `POST /auth/mfa/challenge` и `POST /auth/mfa/confirm`. После 5 неудачных попыток вход блокируется на 15 минут для этой почты, этого IP и этого устройства (если передан `X-Fingerprint-Event`). Вход с устройства, которого аккаунт раньше не видел, присылает владельцу письмо. Требует токен капчи, если она включена.'
			}
		}
	)
	.post('/mfa/challenge', async ({ body }) => await startMfaChallenge(body), {
		body: 'MfaChallengePayload',
		response: 'MfaChallengeResponse',
		detail: {
			summary: 'Выбор способа подтверждения входа',
			description:
				'Второй шаг входа с двухфакторной защитой: по `mfaToken` из ответа на вход выбирает способ подтверждения и начинает проверку. Способ должен быть из `mfaMethods`. Повторный вызов заменяет прежнюю проверку. Если `mfaToken` истёк - 401, нужно войти заново.'
		}
	})
	.post(
		'/mfa/confirm',
		async ({ body, ip, userAgent, visitorId, authCookie }) => {
			const result = await confirmMfa(body, { ip, userAgent, visitorId })

			return authCookie.issue(result)
		},
		{
			body: 'MfaConfirmPayload',
			fingerprint: true,
			response: 'AuthResponse',
			detail: {
				summary: 'Подтверждение входа вторым фактором',
				description:
					'Проверяет код для выбранного в `POST /auth/mfa/challenge` способа. При успехе открывает сессию (access-токен в теле, refresh-токен в httpOnly-cookie `tc_refresh`), а `mfaToken` сгорает. Неверный код можно ввести повторно, пока билет жив; после 5 неверных кодов проверка блокируется на 15 минут. Использованный резервный код больше не действует.'
			}
		}
	)
	.post(
		'/refresh',
		async ({ visitorId, authCookie }) => {
			const token = authCookie.read()

			if (!token) {
				throw new BadRequestError('Missing refresh token cookie')
			}

			return authCookie.issue(await refreshTokenPair(token, visitorId))
		},
		{
			fingerprint: true,
			response: 'AccessTokenResponse',
			detail: {
				summary: 'Обновление access-токена',
				description:
					"Выдаёт новый access-токен по refresh-токену из httpOnly-cookie `tc_refresh`. Тело запроса не нужно - браузер отправит cookie сам (в `fetch` укажите `credentials: 'include'`). Refresh-токен при этом меняется: новый приходит в той же cookie, старый больше не действует, а его повторное использование считается кражей и завершает всю сессию. Без cookie - 400."
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
		async ({ body, ip, userAgent, visitorId, authCookie }) => {
			const result = await resetPassword(body, { ip, userAgent, visitorId })

			if (result.mfaRequired) {
				return result
			}

			return authCookie.issue(result)
		},
		{
			body: 'ResetPasswordPayload',
			fingerprint: true,
			response: 'SignInResponse',
			detail: {
				summary: 'Сброс пароля',
				description:
					'Проверяет код из письма и устанавливает новый пароль. Все остальные сессии завершаются. Если двухфакторная защита выключена, на этом устройстве сразу открывается новая сессия; если включена - в ответе `mfaToken`, и вход нужно подтвердить вторым фактором (сброс пароля по почте её не обходит).'
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
				description:
					'Завершает текущую сессию и удаляет cookie `tc_refresh`. Access-токен клиенту достаточно забыть - после выхода сервер его больше не принимает.',
				security: [{ bearerAuth: [] }]
			}
		}
	)
