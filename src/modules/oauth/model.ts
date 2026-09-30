import { type Static, t } from 'elysia'

import { OAUTH_PROVIDER_NAMES } from '~/lib/integrations/oauth'

export const OAuthProviderParams = t.Object({
	provider: t.UnionEnum(OAUTH_PROVIDER_NAMES, { error: 'Unsupported OAuth provider' })
})

export const OAuthCallbackQuery = t.Object({
	state: t.String({ description: 'Opaque state id issued by the start endpoint.' }),
	code: t.Optional(t.String({ description: 'Authorization code returned by the provider.' })),
	error: t.Optional(
		t.String({
			description: 'Set instead of `code` when the user declines or the provider fails.'
		})
	),
	error_description: t.Optional(t.String())
})

export const OAuthStartResponse = t.Object({
	url: t.String({
		description: 'Redirect the user here to continue at the provider.',
		examples: ['https://accounts.google.com/o/oauth2/v2/auth?client_id=...']
	})
})

export type OAuthProviderParamsInput = Static<typeof OAuthProviderParams>
export type OAuthCallbackQueryInput = Static<typeof OAuthCallbackQuery>
