import { discord, github, google, telegram, yandex } from '@teacoder/oauth'

import { AuthProvider } from '@prisma/generated/client'

import { env } from '~/config/env'

export const OAUTH_PROVIDERS = {
	google: google({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }),
	github: github({ clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET }),
	discord: discord({ clientId: env.DISCORD_CLIENT_ID, clientSecret: env.DISCORD_CLIENT_SECRET }),
	yandex: yandex({ clientId: env.YANDEX_CLIENT_ID, clientSecret: env.YANDEX_CLIENT_SECRET }),
	telegram: telegram({
		clientId: env.TELEGRAM_CLIENT_ID,
		clientSecret: env.TELEGRAM_CLIENT_SECRET
	})
}

export type OAuthProviderName = keyof typeof OAUTH_PROVIDERS

export const OAUTH_PROVIDER_NAMES = Object.keys(OAUTH_PROVIDERS) as [
	OAuthProviderName,
	...OAuthProviderName[]
]

/** How each provider is stored on OAuthAccount rows. */
export const AUTH_PROVIDER = {
	google: AuthProvider.GOOGLE,
	github: AuthProvider.GITHUB,
	discord: AuthProvider.DISCORD,
	yandex: AuthProvider.YANDEX,
	telegram: AuthProvider.TELEGRAM
} satisfies Record<OAuthProviderName, AuthProvider>

export const isOAuthProvider = (name: string): name is OAuthProviderName =>
	Object.hasOwn(OAUTH_PROVIDERS, name)

export const OAUTH_PROVIDER_NAME = Object.fromEntries(
	Object.entries(AUTH_PROVIDER).map(([name, provider]) => [provider, name])
) as Record<AuthProvider, OAuthProviderName>

/** "Google", "GitHub", "Яндекс" - for messages shown to users. */
export const providerLabel = (provider: AuthProvider) =>
	OAUTH_PROVIDERS[OAUTH_PROVIDER_NAME[provider]].label

/** Russian names for user-facing text (emails, admin bot). */
export const AUTH_PROVIDER_TITLES: Record<AuthProvider, string> = {
	[AuthProvider.GOOGLE]: 'Google',
	[AuthProvider.GITHUB]: 'GitHub',
	[AuthProvider.DISCORD]: 'Discord',
	[AuthProvider.YANDEX]: 'Яндекс',
	[AuthProvider.TELEGRAM]: 'Telegram'
}

const CALLBACK_BASE = (env.OAUTH_CALLBACK_URL || `${env.APP_URL}/auth/callback`).replace(/\/+$/, '')

/** The site page a provider returns to - it hands the query to POST /auth/sso/:provider/callback. */
export const oauthRedirectUri = (name: OAuthProviderName) => `${CALLBACK_BASE}/${name}`
