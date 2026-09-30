import { Elysia } from 'elysia'

import { env } from '~/config/env'
import { API_VERSION } from '~/config/version'
import { captcha } from '~/lib/integrations/captcha'
import { pingDatabase } from '~/lib/db'
import { OAUTH_PROVIDER_NAMES } from '~/lib/integrations/oauth'
import { pingRedis } from '~/lib/redis'
import { listAvailablePaymentMethods } from '~/modules/billing/service'

import { HealthResponse, RootResponse } from './model'

export const root = new Elysia({ tags: ['Core'] })
	.model({ RootResponse, HealthResponse })
	.get(
		'/',
		() => ({
			message: "What's up motherfuckers! 🤘",
			version: API_VERSION,
			app: { url: env.APP_URL },
			features: {
				auth: {
					providers: OAUTH_PROVIDER_NAMES
				},
				payments: listAvailablePaymentMethods(),
				captcha: {
					provider: env.CAPTCHA_PROVIDER,
					key: captcha?.siteKey || null
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
					'Main API entry point - a greeting plus the config clients need to bootstrap.'
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
