import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { requestContext } from '~/plugins/request-context'

import { HealthResponse, RootResponse } from './model'
import { getClientConfiguration, getHealth } from './service'

export const root = new Elysia({ tags: [TAG.core] })
	.use(requestContext)
	.model({ RootResponse, HealthResponse })
	.get('/', async ({ ip }) => await getClientConfiguration(ip), {
		response: 'RootResponse',
		detail: {
			summary: 'Конфигурация клиента',
			description:
				'Точка входа API. Отдаёт всё, что нужно клиенту при запуске: доступные способы входа и оплаты, цены премиум-подписки, активную капчу с публичным ключом виджета, адреса сайта и файлового хранилища.'
		}
	})
	.get(
		'/health',
		async ({ set }) => {
			const health = await getHealth()

			if (health.status === 'degraded') {
				set.status = 503
			}

			return health
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
