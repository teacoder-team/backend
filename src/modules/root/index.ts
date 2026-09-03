import { Elysia } from 'elysia'

import { pingDatabase } from '@/infra/db'
import { pingRedis } from '@/infra/redis'
import { ok } from '@/shared/api'
import { HealthResponse, RootResponse } from './model'

export const root = new Elysia({ tags: ['Core'] })
	.model({ RootResponse, HealthResponse })
	.get('/', () => ok({ message: "What's up motherfuckers! 🤘" }), {
		response: 'RootResponse',
		detail: {
			summary: 'System greeting',
			description: 'Main API entry point returning a message.',
		},
	})
	.get(
		'/health',
		async ({ set }) => {
			const [database, cache] = await Promise.all([
				pingDatabase(),
				pingRedis(),
			])

			const healthy = database && cache

			if (!healthy) set.status = 503

			return ok({
				status: healthy
					? ('operational' as const)
					: ('degraded' as const),
				database,
				cache,
				timestamp: new Date().toISOString(),
			})
		},
		{
			response: 'HealthResponse',
			detail: {
				summary: 'System health check',
				description:
					'Reports whether this instance can reach PostgreSQL and Redis.',
			},
		},
	)
