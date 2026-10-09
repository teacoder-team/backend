import { type Static, t } from 'elysia'

import { AuthProvider } from '@prisma/generated/client'

import { OAUTH_PROVIDER_NAMES, type OAuthProviderName } from '~/lib/integrations/oauth'
import { PrismaEnum } from '~/lib/utils/schema'
import {
	SIGN_IN_COMPLETED_DESCRIPTION,
	SIGN_IN_MFA_REQUIRED_DESCRIPTION,
	SignInCompletedFields,
	SignInMfaRequiredFields
} from '~/modules/auth/model'
import type { RequestOrigin } from '~/modules/session/model'

export const OAuthProviderParams = t.Object({
	provider: t.UnionEnum(OAUTH_PROVIDER_NAMES, {
		description: 'Провайдер входа.',
		error: 'Unsupported OAuth provider'
	})
})

export const OAuthCallbackPayload = t.Object(
	{
		query: t.String({
			minLength: 1,
			maxLength: 4096,
			description:
				'Строка запроса, с которой провайдер вернул пользователя на страницу сайта (`window.location.search`), - без изменений. В ней `code` и `state` или, если вход отменён, `error`.',
			error: 'Callback query is required',
			examples: ['?code=4%2F0AQlEd8x...&state=Zl9kS2...&scope=openid%20email']
		})
	},
	{ description: 'Ответ провайдера, переданный сайтом.' }
)

export const OAuthStartResponse = t.Object(
	{
		url: t.String({
			description: 'Страница входа провайдера - перенаправьте туда пользователя.',
			examples: ['https://accounts.google.com/o/oauth2/v2/auth?client_id=...']
		})
	},
	{ description: 'Ссылка для входа через провайдера.' }
)

export type OAuthProviderParamsInput = Static<typeof OAuthProviderParams>
export type OAuthCallbackInput = Static<typeof OAuthCallbackPayload>

const Intent = <const T extends string>(value: T, description: string) =>
	t.Literal(value, { description })

export const OAuthCallbackResponse = t.Union(
	[
		t.Object(
			{ intent: Intent('SIGN_IN', 'Это был вход через соцсеть.'), ...SignInCompletedFields },
			{ description: SIGN_IN_COMPLETED_DESCRIPTION }
		),
		t.Object(
			{
				intent: Intent('SIGN_IN', 'Это был вход через соцсеть.'),
				...SignInMfaRequiredFields
			},
			{ description: SIGN_IN_MFA_REQUIRED_DESCRIPTION }
		),
		t.Object(
			{
				intent: Intent('LINK', 'Это была привязка соцсети из настроек аккаунта.'),
				provider: PrismaEnum(AuthProvider, {
					description: 'Привязанная соцсеть.',
					examples: [AuthProvider.DISCORD]
				})
			},
			{
				description:
					'Соцсеть привязана к аккаунту, который начал привязку. Сессия и токены не меняются.'
			}
		)
	],
	{
		description:
			'`intent` говорит, чем закончился возврат от провайдера: входом (`SIGN_IN`, дальше как у `POST /auth/login`) или привязкой (`LINK`).'
	}
)

export const OAuthAccountsResponse = t.Object(
	{
		accounts: t.Array(
			t.Object({
				provider: PrismaEnum(AuthProvider, {
					description: 'Соцсеть.',
					examples: [AuthProvider.GOOGLE]
				}),
				slug: t.UnionEnum(OAUTH_PROVIDER_NAMES, {
					description: 'Имя провайдера в путях `/auth/sso/:provider/...`.',
					examples: ['google']
				}),
				linked: t.Boolean({ description: 'Привязана ли к аккаунту.' }),
				linkedAt: t.Nullable(
					t.String({
						description: 'Когда привязана. `null`, если не привязана.',
						examples: ['2026-09-30T14:16:54.000Z']
					})
				)
			}),
			{ description: 'Все поддерживаемые соцсети - и привязанные, и нет.' }
		),
		canUnlink: t.Boolean({
			description:
				'Можно ли сейчас отвязать соцсеть. `false`, если привязанная соцсеть - единственный способ входа (пароля нет, других соцсетей нет).'
		})
	},
	{ description: 'Соцсети, через которые можно входить в аккаунт.' }
)

export interface LinkRequest {
	userId: string
	sessionId: string
}

export interface OAuthState extends RequestOrigin {
	provider: OAuthProviderName

	redirectUri: string

	bindingHash: string
	codeVerifier?: string
	link?: LinkRequest
}

export type ResolvedUser =
	| { outcome: 'login'; userId: string }
	| { outcome: 'email_match'; userId: string }
	| { outcome: 'signup'; userId: string }

export interface OAuthIdentity {
	provider: AuthProvider
	providerAccountId: string
}
