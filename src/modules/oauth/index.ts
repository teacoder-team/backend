import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { AuthResponse } from '~/modules/auth/model'
import { authCookie } from '~/plugins/auth-cookie'
import { requestContext } from '~/plugins/request-context'

import { OAuthCallbackQuery, OAuthProviderParams, OAuthStartResponse } from './model'
import { finishOAuth, startOAuth } from './service'

export const oauth = new Elysia({ prefix: '/oauth', tags: [TAG.oauth] })
	.use(requestContext)
	.use(authCookie)
	.model({ OAuthProviderParams, OAuthCallbackQuery, OAuthStartResponse, AuthResponse })
	.post(
		'/:provider/start',
		async ({ params, ip, userAgent }) => await startOAuth(params.provider, { ip, userAgent }),
		{
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

			authCookie.set(result)

			return result
		},
		{
			params: 'OAuthProviderParams',
			query: 'OAuthCallbackQuery',
			response: 'AuthResponse',
			detail: {
				summary: 'Возврат от провайдера',
				description:
					'Сюда провайдер возвращает пользователя после входа. Проверяет ответ, находит аккаунт (или привязывает к существующему по подтверждённой почте, или создаёт новый) и открывает сессию. Вызывать вручную не нужно.'
			}
		}
	)
