import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { MessageResponse } from '~/modules/auth/model'
import { authCookie } from '~/plugins/auth-cookie'
import { authGuard } from '~/plugins/auth-guard'
import { fingerprint } from '~/plugins/fingerprint'
import { requestContext } from '~/plugins/request-context'

import {
	OAuthAccountsResponse,
	OAuthCallbackPayload,
	OAuthCallbackResponse,
	OAuthProviderParams,
	OAuthStartResponse
} from './model'
import { finishOAuth, getOAuthAccounts, startOAuth, startOAuthLink, unlinkOAuth } from './service'

export const oauth = new Elysia({ prefix: '/auth/sso', tags: [TAG.oauth] })
	.use(requestContext)
	.use(authCookie)
	.use(authGuard)
	.use(fingerprint)
	.model({
		OAuthProviderParams,
		OAuthCallbackPayload,
		OAuthStartResponse,
		OAuthCallbackResponse,
		OAuthAccountsResponse,
		MessageResponse
	})
	.post(
		'/:provider/start',
		async ({ params, ip, userAgent, visitorId, oauthBinding }) => {
			const { url, binding } = await startOAuth(
				params.provider,
				{ ip, userAgent, visitorId },
				oauthBinding.read()
			)

			oauthBinding.set(binding)

			return { url }
		},
		{
			fingerprint: true,
			params: 'OAuthProviderParams',
			response: 'OAuthStartResponse',
			detail: {
				summary: 'Начало входа через соцсеть',
				description:
					'Возвращает ссылку на страницу провайдера - на неё нужно перенаправить пользователя. После входа провайдер вернёт его на страницу сайта `/auth/callback/:provider`, а та передаст ответ в `POST /auth/sso/:provider/callback`.\n\nСтавит httpOnly-cookie `tc_oauth`, которая привязывает вход к этому браузеру, поэтому запрос нужно отправлять с `credentials: \'include\'`. Ссылка одноразовая и действует 10 минут; защищена `state` и, где провайдер поддерживает, PKCE.'
			}
		}
	)
	.post(
		'/:provider/callback',
		async ({ params, body, authCookie, oauthBinding }) => {
			const result = await finishOAuth(params.provider, body.query, oauthBinding.read())

			if (result.intent === 'LINK' || result.mfaRequired) {
				return result
			}

			return authCookie.issue(result)
		},
		{
			params: 'OAuthProviderParams',
			body: 'OAuthCallbackPayload',
			response: 'OAuthCallbackResponse',
			detail: {
				summary: 'Завершение входа через соцсеть',
				description:
					'Провайдер возвращает пользователя на страницу сайта `/auth/callback/:provider`; страница передаёт сюда свою строку запроса как есть. Вызывать один раз - `state` одноразовый, повторный вызов даст 403. Запрос - с `credentials: \'include\'`: нужна cookie `tc_oauth` из `start`/`link`, без неё (вход начат в другом браузере) - 403.\n\n`intent` в ответе говорит, что это было.\n\n**Вход** (`intent: SIGN_IN`): находит аккаунт по этой соцсети, иначе по совпадающей подтверждённой почте (и тогда автоматически привязывает соцсеть к нему - см. `linkedProvider`), иначе создаёт новый. Если у аккаунта включена двухфакторная защита, сессия не создаётся - в ответе `mfaToken`, как у `POST /auth/login`, а автоматическая привязка происходит после подтверждения. Иначе - access-токен в теле, refresh-токен в httpOnly-cookie `tc_refresh`.\n\n**Привязка** (`intent: LINK`): привязывает соцсеть к аккаунту, начавшему привязку; почта соцсети может быть любой. Если этот аккаунт соцсети уже привязан к другому пользователю - 409.\n\nЕсли пользователь отменил вход у провайдера - 400.'
			}
		}
	)
	.guard({ auth: true, detail: { security: [{ bearerAuth: [] }] } })
	.get('/accounts', async ({ session }) => await getOAuthAccounts(session.userId), {
		response: 'OAuthAccountsResponse',
		detail: {
			summary: 'Привязанные соцсети',
			description:
				'Все поддерживаемые соцсети с отметкой, привязана ли каждая к аккаунту, и можно ли сейчас что-то отвязать.'
		}
	})
	.post(
		'/:provider/link',
		async ({ session, params, ip, userAgent, oauthBinding }) => {
			const { url, binding } = await startOAuthLink(
				params.provider,
				{ userId: session.userId, sessionId: session.id },
				{ ip, userAgent },
				oauthBinding.read()
			)

			oauthBinding.set(binding)

			return { url }
		},
		{
			params: 'OAuthProviderParams',
			response: 'OAuthStartResponse',
			detail: {
				summary: 'Привязка соцсети',
				description:
					'Возвращает ссылку на страницу провайдера, как `POST /auth/sso/:provider/start` (и так же ставит cookie `tc_oauth`), но после возврата соцсеть привязывается к текущему аккаунту, а не выполняется вход. Почта в соцсети может отличаться от почты аккаунта.'
			}
		}
	)
	.delete(
		'/accounts/:provider',
		async ({ session, params }) => {
			await unlinkOAuth(session.userId, params.provider)

			return { message: 'Provider unlinked' }
		},
		{
			params: 'OAuthProviderParams',
			response: 'MessageResponse',
			detail: {
				summary: 'Отвязка соцсети',
				description:
					'Отвязывает соцсеть от аккаунта. Нельзя отвязать единственный способ входа.'
			}
		}
	)
