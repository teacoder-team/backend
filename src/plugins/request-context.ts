import { env, isDevelopment } from '~/config/env'
import { logContext, logger } from '~/lib/logger'
import { getForwardedIp } from '~/lib/utils/ip'
import { Elysia } from 'elysia'

import { randomUUID } from 'node:crypto'

const REQUEST_ID_HEADER = 'x-request-id'

const LOOPBACK = '127.0.0.1'
/** Localhost has no geolocation, so in development requests pose as a real public address. */
const DEVELOPMENT_IP = '104.28.225.185'

const clientIp = (headers: Headers) =>
	isDevelopment ? DEVELOPMENT_IP : (getForwardedIp(headers) ?? LOOPBACK)

export const requestContext = new Elysia({ name: 'request-context' }).derive(
	{ as: 'global' },
	({ request, set }) => {
		const requestId = request.headers.get(REQUEST_ID_HEADER) ?? randomUUID()

		logContext.enterWith({ requestId })

		set.headers[REQUEST_ID_HEADER] = requestId

		return {
			requestId,
			ip: clientIp(request.headers),
			userAgent: request.headers.get('user-agent') ?? 'Unknown'
		}
	}
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
				duration: Number(duration.toFixed(1))
			},
			'request_completed'
		)
	})
