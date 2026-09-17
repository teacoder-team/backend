import { type Static, t } from 'elysia'

export const OAuthProviderParams = t.Object({
	provider: t.UnionEnum(['google', 'github', 'discord', 'yandex', 'telegram'], {
		error: 'Unsupported OAuth provider'
	})
})

export const OAuthCallbackQuery = t.Object({
	code: t.String({ description: 'Authorization code returned by the provider.' }),
	state: t.String({ description: 'Opaque state id issued by the start endpoint.' })
})

export const OAuthStartResponse = t.Object({
	url: t.String({
		description: 'Redirect the user here to continue at the provider.',
		examples: ['https://accounts.google.com/o/oauth2/v2/auth?client_id=...']
	})
})

export type OAuthProviderParamsInput = Static<typeof OAuthProviderParams>
export type OAuthCallbackQueryInput = Static<typeof OAuthCallbackQuery>
