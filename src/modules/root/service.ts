import { env } from '~/config/env'
import { API_VERSION } from '~/config/version'
import { lookupCountryCode } from '~/lib/datasets/geo'
import { pingDatabase } from '~/lib/db'
import { captcha } from '~/lib/integrations/captcha'
import { OAUTH_PROVIDER_NAMES, type OAuthProviderName } from '~/lib/integrations/oauth'
import { logger } from '~/lib/logger'
import { pingRedis } from '~/lib/redis'
import { listAvailablePaymentMethods } from '~/modules/billing/service'
import { PREMIUM_INTERNATIONAL_AMOUNT, PREMIUM_PLAN } from '~/modules/subscription/service'

const RUSSIAN_PROVIDERS = ['yandex', 'vk'] satisfies OAuthProviderName[]

const RUSSIA = 'RU'

const isRussian = (name: OAuthProviderName) =>
	(RUSSIAN_PROVIDERS as readonly OAuthProviderName[]).includes(name)

const WORLDWIDE = [...OAUTH_PROVIDER_NAMES.filter((name) => !isRussian(name)), ...RUSSIAN_PROVIDERS]

const signInProviders = (countryCode: string | null) =>
	countryCode === RUSSIA ? RUSSIAN_PROVIDERS : WORLDWIDE

const resolveCountryCode = async (ip: string) =>
	await lookupCountryCode(ip).catch((err: unknown) => {
		logger.warn({ context: 'geo', err }, 'country_lookup_failed')

		return null
	})

export const getClientConfiguration = async (ip: string) => {
	const country = await resolveCountryCode(ip)

	return {
		message: "What's up motherfuckers! 🤘",
		version: API_VERSION,
		app: { url: env.APP_URL },
		features: {
			auth: {
				country,
				providers: signInProviders(country)
			},
			payments: listAvailablePaymentMethods(),
			premium: {
				months: PREMIUM_PLAN.months,
				currency: 'RUB',
				prices: {
					standard: PREMIUM_PLAN.amount,
					international: PREMIUM_INTERNATIONAL_AMOUNT
				},
				stars: PREMIUM_PLAN.stars
			},
			captcha: {
				provider: env.CAPTCHA_PROVIDER,
				key: captcha?.siteKey || null
			},
			orion: {
				url: env.ORION_API_URL
			}
		}
	}
}

export const getHealth = async () => {
	const [database, cache] = await Promise.all([pingDatabase(), pingRedis()])

	return {
		status: database && cache ? ('operational' as const) : ('degraded' as const),
		database,
		cache,
		timestamp: new Date().toISOString()
	}
}
