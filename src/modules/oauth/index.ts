import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { MessageResponse } from '~/modules/auth/model'
import { authCookie } from '~/plugins/auth-cookie'
import { authGuard } from '~/plugins/auth-guard'
import { fingerprint } from '~/plugins/fingerprint'
import { requestContext } from '~/plugins/request-context'

import {
	OAuthAccountsResponse,
	OAuthCallbackQuery,
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
		OAuthCallbackQuery,
		OAuthStartResponse,
		OAuthCallbackResponse,
		OAuthAccountsResponse,
		MessageResponse
	})
	.post(
		'/:provider/start',
		async ({ params, ip, userAgent, visitorId }) =>
			await startOAuth(params.provider, { ip, userAgent, visitorId }),
		{
			fingerprint: true,
			params: 'OAuthProviderParams',
			response: 'OAuthStartResponse',
			detail: {
				summary: 'Начало входа через соцсеть',
				description:
					'Возвращает ссылку на страницу входа провайдера - на неё нужно перенаправить пользователя. Ссылка одноразовая и действует 10 минут; защищена параметром `state` и, где провайдер поддерживает, PKCE.'
			}
		}
	)
	.get(
		'/:provider/callback',
		async ({ params, request, authCookie }) => {
			const result = await finishOAuth(params.provider, new URL(request.url).search)

			if (result.intent === 'LINK' || result.mfaRequired) {
				return result
			}

			return authCookie.issue(result)
		},
		{
			params: 'OAuthProviderParams',
			query: 'OAuthCallbackQuery',
			response: 'OAuthCallbackResponse',
			detail: {
				summary: 'Возврат от провайдера',
				description:
					'Сюда провайдер возвращает пользователя - и после входа, и после привязки из настроек (`intent` в ответе говорит, что это было).\n\n**Вход** (`intent: SIGN_IN`): находит аккаунт по этой соцсети, иначе по совпадающей подтверждённой почте (и тогда автоматически привязывает соцсеть к нему - см. `linkedProvider`), иначе создаёт новый. Если у аккаунта включена двухфакторная защита, сессия не создаётся - в ответе `mfaToken`, как у `POST /auth/login`, а автоматическая привязка происходит после подтверждения.\n\n**Привязка** (`intent: LINK`): привязывает соцсеть к аккаунту, начавшему привязку; почта соцсети может быть любой. Если этот аккаунт соцсети уже привязан к другому пользователю - 409.\n\nВызывать вручную не нужно.'
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
		async ({ session, params, ip, userAgent }) =>
			await startOAuthLink(
				params.provider,
				{ userId: session.userId, sessionId: session.id },
				{ ip, userAgent }
			),
		{
			params: 'OAuthProviderParams',
			response: 'OAuthStartResponse',
			detail: {
				summary: 'Привязка соцсети',
				description:
					'Возвращает ссылку на страницу провайдера, как `POST /auth/sso/:provider/start`, но после возврата соцсеть привязывается к текущему аккаунту, а не выполняется вход. Почта в соцсети может отличаться от почты аккаунта.'
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
