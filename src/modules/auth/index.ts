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
	LoginResponse,
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
		LoginResponse,
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

			return { message: 'Check your email for the verification link' }
		},
		{
			body: 'RegisterPayload',
			response: 'MessageResponse',
			detail: {
				summary: 'Регистрация',
				description:
					'Создаёт неподтверждённый аккаунт и отправляет ссылку `{APP_URL}/auth/verify/{token}`. Ссылка одноразовая и действует 30 минут; новая ссылка отменяет предыдущую. Повторная регистрация неподтверждённой почты отправляет письмо для существующего аккаунта, не меняя пароль. Письма отправляются не чаще раза в минуту. Требует токен капчи, если она включена.'
			}
		}
	)
	.post(
		'/verify',
		async ({ body, ip, userAgent, visitorId, authCookie }) => {
			const result = await verifyRegister(body, { ip, userAgent, visitorId })

			if (result.mfaRequired) {
				return result
			}

			return authCookie.issue(result)
		},
		{
			body: 'VerifyRegisterPayload',
			fingerprint: true,
			response: 'SignInResponse',
			detail: {
				summary: 'Подтверждение регистрации',
				description:
					'Принимает только `{ token }` из ссылки в письме. Подтверждает привязанную к токену почту и активирует аккаунт. Без MFA сразу открывает сессию: access-токен в теле, refresh-токен в httpOnly-cookie `tc_refresh`. При включённой MFA возвращает билет второго шага без создания сессии. Ссылка действует 30 минут и срабатывает один раз; повторный, просроченный или заменённый токен вернёт 400. Фронтенд должен отправить токен POST-запросом после открытия страницы, сам переход по ссылке его не расходует.'
			}
		}
	)
	.post(
		'/login',
		async ({ body, ip, userAgent, visitorId, authCookie }) => {
			const result = await login(body, { ip, userAgent, visitorId })

			if ('emailVerificationRequired' in result || result.mfaRequired) {
				return result
			}

			return authCookie.issue(result)
		},
		{
			body: 'LoginPayload',
			fingerprint: true,
			response: 'LoginResponse',
			detail: {
				summary: 'Вход по почте и паролю',
				description:
					'Проверяет пароль. Если почта не подтверждена, отправляет ссылку подтверждения и возвращает `emailVerificationRequired: true` с `resendAfter` в секундах; сессия и токены не создаются. Повторные письма ограничены одним в минуту, неверный пароль письмо не отправляет. При подтверждённой почте без MFA открывает сессию: access-токен в теле, refresh-токен в httpOnly-cookie `tc_refresh`. При включённой MFA возвращает `mfaRequired: true` и билет второго шага без сессии. После 5 неверных паролей вход блокируется на 15 минут для почты, IP и устройства. Вход с нового устройства присылает владельцу письмо. Требует токен капчи, если она включена.'
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
					'Отправляет на почту ссылку для сброса пароля: `{APP_URL}/auth/recovery/{token}`, действует 30 минут, новая ссылка отменяет прежнюю. Отвечает одинаково независимо от того, есть ли такой аккаунт, - так нельзя узнать, зарегистрирована ли почта. Требует токен капчи, если она включена.'
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
					'Проверяет токен из ссылки в письме и устанавливает новый пароль. Токен одноразовый: после любого вызова с ним нужно запросить новую ссылку. Все остальные сессии завершаются. Если двухфакторная защита выключена, на этом устройстве сразу открывается новая сессия; если включена - в ответе `mfaToken`, и вход нужно подтвердить вторым фактором (сброс пароля по почте её не обходит).'
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
