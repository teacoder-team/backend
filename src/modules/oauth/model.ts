import { type Static, t } from 'elysia'

import { OAUTH_PROVIDER_NAMES } from '~/lib/integrations/oauth'

export const OAuthProviderParams = t.Object({
	provider: t.UnionEnum(OAUTH_PROVIDER_NAMES, {
		description: 'Провайдер входа.',
		error: 'Unsupported OAuth provider'
	})
})

export const OAuthCallbackQuery = t.Object({
	state: t.String({ description: 'Значение `state`, выданное при начале входа.' }),
	code: t.Optional(t.String({ description: 'Код авторизации от провайдера.' })),
	error: t.Optional(
		t.String({
			description:
				'Приходит вместо `code`, если пользователь отменил вход или у провайдера произошла ошибка.'
		})
	),
	error_description: t.Optional(t.String({ description: 'Пояснение ошибки от провайдера.' }))
})

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
export type OAuthCallbackQueryInput = Static<typeof OAuthCallbackQuery>
