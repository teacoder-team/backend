import { discordProvider } from './discord'
import { githubProvider } from './github'
import { googleProvider } from './google'
import { telegramProvider } from './telegram'
import type { OAuthProviderAdapter } from './types'
import { yandexProvider } from './yandex'

export const OAUTH_PROVIDERS = {
	google: googleProvider,
	github: githubProvider,
	discord: discordProvider,
	yandex: yandexProvider,
	telegram: telegramProvider
} satisfies Record<string, OAuthProviderAdapter>

export type OAuthProviderName = keyof typeof OAUTH_PROVIDERS
