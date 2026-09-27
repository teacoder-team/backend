import { Elysia } from 'elysia'

import { env } from '~/config/env'
import { API_VERSION } from '~/config/version'
import { pingDatabase } from '~/infra/db'
import { OAUTH_PROVIDERS } from '~/infra/oauth/registry'
import { pingRedis } from '~/infra/redis'
import { listAvailablePaymentMethods } from '~/modules/billing/service'

import { HealthResponse, RootResponse } from './model'

const captchaClientKey = (): string | null => {
	if (env.CAPTCHA_PROVIDER === 'turnstile') return env.TURNSTILE_SITE_KEY || null
	if (env.CAPTCHA_PROVIDER === 'yandex') return env.YANDEX_CAPTCHA_CLIENT_KEY || null

	return null
}

export const root = new Elysia({ tags: ['Core'] })
	.model({ RootResponse, HealthResponse })
	.get(
		'/',
		() => ({
			message: "What's up motherfuckers! 🤘",
			version: API_VERSION,
			app: { url: env.APP_PUBLIC_URL },
			features: {
				auth: {
					providers: Object.keys(OAUTH_PROVIDERS)
				},
				payments: listAvailablePaymentMethods(),
				captcha: {
					provider: env.CAPTCHA_PROVIDER,
					clientKey: captchaClientKey()
				},
				orion: {
					url: env.ORION_API_URL
				}
			}
		}),
		{
			response: 'RootResponse',
			detail: {
				summary: 'System greeting',
				description:
					'Main API entry point - a greeting plus the config clients need to bootstrap (supported SSO providers, available payment methods, active captcha provider and its public key, Orion base URL).'
			}
		}
	)
	.get(
		'/health',
		async ({ set }) => {
			const [database, cache] = await Promise.all([pingDatabase(), pingRedis()])

			const healthy = database && cache

			if (!healthy) set.status = 503

			return {
				status: healthy ? ('operational' as const) : ('degraded' as const),
				database,
				cache,
				timestamp: new Date().toISOString()
			}
		},
		{
			response: 'HealthResponse',
			detail: {
				summary: 'System health check',
				description: 'Reports whether this instance can reach PostgreSQL and Redis.'
			}
		}
	)
