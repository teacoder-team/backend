import { Elysia, t } from 'elysia'

import { TAG } from '~/config/openapi'
import { AuthResponse, MessageResponse } from '~/modules/auth/model'
import { authCookie } from '~/plugins/auth-cookie'
import { authGuard } from '~/plugins/auth-guard'
import { fingerprint } from '~/plugins/fingerprint'
import { requestContext } from '~/plugins/request-context'

import {
	WebAuthnCredentialListResponse,
	WebAuthnCredentialParams,
	WebAuthnLoginOptionsPayload,
	WebAuthnLoginPayload,
	WebAuthnOptionsResponse,
	WebAuthnRegisterPayload,
	WebAuthnRegisterResponse
} from './model'
import {
	finishLogin,
	finishRegistration,
	getCredentials,
	removeCredential,
	startLogin,
	startRegistration
} from './service'

export const webauthn = new Elysia({ prefix: '/auth/webauthn', tags: [TAG.webauthn] })
	.use(requestContext)
	.use(authCookie)
	.use(authGuard)
	.use(fingerprint)
	.model({
		WebAuthnOptionsResponse,
		WebAuthnRegisterPayload,
		WebAuthnRegisterResponse,
		WebAuthnLoginPayload,
		WebAuthnCredentialListResponse,
		WebAuthnCredentialParams,
		AuthResponse,
		MessageResponse
	})
	.post('/login/options', async ({ body }) => await startLogin(body ?? {}), {
		body: t.Optional(WebAuthnLoginOptionsPayload),
		response: 'WebAuthnOptionsResponse',
		detail: {
			summary: 'Вход по ключу: параметры',
			description:
				'Два режима.\n\n**Вход без пароля** - без тела (или `{}`): браузер сам предложит сохранённые ключи доступа этого сайта. Требуется проверка пользователя (биометрия или PIN), поэтому такой вход уже двухфакторный - второй фактор после него не спрашивается.\n\n**Второй фактор** - `{ mfaToken }` из ответа на вход, если в `mfaMethods` есть `WEBAUTHN`: браузер предложит только ключи этого аккаунта.'
		}
	})
	.post(
		'/login/verify',
		async ({ body, ip, userAgent, visitorId, authCookie }) =>
			authCookie.issue(await finishLogin(body, { ip, userAgent, visitorId })),
		{
			body: 'WebAuthnLoginPayload',
			fingerprint: true,
			response: 'AuthResponse',
			detail: {
				summary: 'Вход по ключу: проверка',
				description:
					'Проверяет подпись ключа и открывает сессию: access-токен в теле, refresh-токен в httpOnly-cookie `tc_refresh`. Для второго фактора передайте тот же `mfaToken`, что и в `/login/options` - билет сгорает, а отложенная привязка соцсети (если была) применяется (`linkedProvider`). Параметры одноразовые: после любой попытки, даже неудачной, запросите новые. Если счётчик подписей ключа не вырос, ключ считается клонированным - 401.'
			}
		}
	)
	.guard({ auth: true, detail: { security: [{ bearerAuth: [] }] } })
	.post('/register/options', async ({ session }) => await startRegistration(session.userId), {
		response: 'WebAuthnOptionsResponse',
		detail: {
			summary: 'Добавление ключа: параметры',
			description:
				'Параметры для создания ключа доступа (Touch ID, Face ID, Windows Hello, менеджер паролей) или аппаратного ключа (YubiKey). Уже добавленные ключи исключены - повторно тот же ключ не создастся.'
		}
	})
	.post(
		'/register/verify',
		async ({ session, body, userAgent }) =>
			await finishRegistration(session.userId, body, userAgent),
		{
			body: 'WebAuthnRegisterPayload',
			response: 'WebAuthnRegisterResponse',
			detail: {
				summary: 'Добавление ключа: проверка',
				description:
					'Проверяет ответ браузера и сохраняет ключ. После этого ключ работает и для входа без пароля, и как второй фактор - а вход по паролю начинает требовать второй фактор. Если это первый второй фактор аккаунта, в ответе - резервные коды (показываются один раз).'
			}
		}
	)
	.get('/credentials', async ({ session }) => await getCredentials(session.userId), {
		response: 'WebAuthnCredentialListResponse',
		detail: {
			summary: 'Ключи аккаунта',
			description: 'Все ключи доступа и аппаратные ключи, добавленные к аккаунту.'
		}
	})
	.delete(
		'/credentials/:id',
		async ({ session, params }) => {
			await removeCredential(session.userId, params.id)

			return { message: 'Security key removed' }
		},
		{
			params: 'WebAuthnCredentialParams',
			response: 'MessageResponse',
			detail: {
				summary: 'Удаление ключа',
				description:
					'Удаляет ключ. Если это был последний второй фактор (ключей больше нет и приложение-аутентификатор не подключено), резервные коды удаляются вместе с ним, и вход по паролю снова не требует второго фактора.'
			}
		}
	)
