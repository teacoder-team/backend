import { randomUUID } from 'node:crypto'

import { Elysia } from 'elysia'

import { logContext, logger } from '@/infra/logger'
import { getClientIp } from '@/shared/ip'

const REQUEST_ID_HEADER = 'x-request-id'

/**
 * Resolves the caller once per request instead of in every handler, and opens
 * the log context so `requestId` lands on every line without being threaded
 * through the call stack.
 */
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
		logger.info(
			{
				method: request.method,
				path,
				status: set.status,
				duration: `${(performance.now() - startedAt).toFixed(1)}ms`,
			},
			'request_completed',
		)
	})
