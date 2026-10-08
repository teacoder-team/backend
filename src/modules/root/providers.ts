import { lookupCountryCode } from '~/lib/datasets/geo'
import { OAUTH_PROVIDER_NAMES, type OAuthProviderName } from '~/lib/integrations/oauth'
import { logger } from '~/lib/logger'

const RUSSIAN_PROVIDERS = ['yandex', 'vk'] satisfies OAuthProviderName[]

const RUSSIA = 'RU'

const isRussian = (name: OAuthProviderName) =>
	(RUSSIAN_PROVIDERS as readonly OAuthProviderName[]).includes(name)

const WORLDWIDE = [...OAUTH_PROVIDER_NAMES.filter((name) => !isRussian(name)), ...RUSSIAN_PROVIDERS]

export const signInProviders = (countryCode: string | null) =>
	countryCode === RUSSIA ? RUSSIAN_PROVIDERS : WORLDWIDE

export const resolveCountryCode = async (ip: string) =>
	await lookupCountryCode(ip).catch((err: unknown) => {
		logger.warn({ context: 'geo', err }, 'country_lookup_failed')

		return null
	})
