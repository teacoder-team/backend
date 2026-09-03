import { randomUUID } from 'node:crypto'

import { Elysia } from 'elysia'

import { env } from '@/config/env'
import { logContext, logger } from '@/infra/logger'
import { getClientIp } from '@/shared/ip'

const REQUEST_ID_HEADER = 'x-request-id'

export const requestContext = new Elysia({ name: 'request-context' }).derive(
	{ as: 'global' },
	({ request, set }) => {
		const requestId = request.headers.get(REQUEST_ID_HEADER) ?? randomUUID()

		logContext.enterWith({ requestId })

		set.headers[REQUEST_ID_HEADER] = requestId

		return {
			requestId,
			ip: getClientIp(request.headers),
			userAgent: request.headers.get('user-agent') ?? 'Unknown',
		}
	},
)

export const requestLogger = new Elysia({ name: 'request-logger' })
	.derive({ as: 'global' }, () => ({ startedAt: performance.now() }))
	.onAfterResponse({ as: 'global' }, ({ request, set, path, startedAt }) => {
		const duration = performance.now() - startedAt
		const status = Number(set.status) || 200

		const isError = status >= 400
		const isSlow = duration >= env.LOG_SLOW_REQUEST_MS
		const sampled = isError || isSlow || Math.random() < env.LOG_SAMPLE_RATE

		if (!sampled) return

		const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'

		logger[level](
			{
				method: request.method,
				path,
				status,
				duration: Number(duration.toFixed(1)),
			},
			'request_completed',
		)
	})
