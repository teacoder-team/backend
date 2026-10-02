import { Elysia } from 'elysia'

import { env } from '~/config/env'
import { TAG } from '~/config/openapi'
import { API_VERSION } from '~/config/version'
import { captcha } from '~/lib/integrations/captcha'
import { pingDatabase } from '~/lib/db'
import { pingRedis } from '~/lib/redis'
import { listAvailablePaymentMethods } from '~/modules/billing/service'
import { requestContext } from '~/plugins/request-context'

import { HealthResponse, RootResponse } from './model'
import { resolveCountryCode, signInProviders } from './providers'

export const root = new Elysia({ tags: [TAG.core] })
	.use(requestContext)
	.model({ RootResponse, HealthResponse })
	.get(
		'/',
		async ({ ip }) => {
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
					captcha: {
						provider: env.CAPTCHA_PROVIDER,
						key: captcha?.siteKey || null
					},
					orion: {
						url: env.ORION_API_URL
					}
				}
			}
		},
		{
			response: 'RootResponse',
			detail: {
				summary: 'Конфигурация клиента',
				description:
					'Точка входа API. Отдаёт всё, что нужно клиенту при запуске: доступные способы входа и оплаты, активную капчу с публичным ключом виджета, адреса сайта и файлового хранилища.'
			}
		}
	)
	.get(
		'/health',
		async ({ set }) => {
			const [database, cache] = await Promise.all([pingDatabase(), pingRedis()])

			const healthy = database && cache

			if (!healthy) {
				set.status = 503
			}

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
				summary: 'Проверка работоспособности',
				description:
					'Проверяет, что сервис видит PostgreSQL и Redis. Если хотя бы одна из них недоступна - отвечает 503 со статусом `degraded`.'
			}
		}
	)
