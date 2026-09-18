import { Elysia } from 'elysia'

import { AuthResponse } from '~/modules/auth/model'
import { authCookie } from '~/plugins/auth-cookie'
import { requestContext } from '~/plugins/request-context'

import { OAuthCallbackQuery, OAuthProviderParams, OAuthStartResponse } from './model'
import { finishOAuth, startOAuth } from './service'

export const oauth = new Elysia({ prefix: '/oauth', tags: ['OAuth'] })
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
				summary: 'Initialize OAuth flow',
				description:
					'Builds the authorization URL for the given provider and stores state (and a PKCE pair, where applicable) in Redis.'
			}
		}
	)
	.get(
		'/:provider/callback',
		async ({ params, query, authCookie }) => {
			const result = await finishOAuth(params.provider, query)

			authCookie.set(result)

			return result
		},
		{
			params: 'OAuthProviderParams',
			query: 'OAuthCallbackQuery',
			response: 'AuthResponse',
			detail: {
				summary: 'OAuth callback handler',
				description:
					'Verifies the provider response, resolves or creates the user, and starts a session.'
			}
		}
	)
