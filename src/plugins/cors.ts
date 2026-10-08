import { Elysia } from 'elysia'

import { env } from '~/config/env'
import { ForbiddenError } from '~/lib/errors'
import { createOriginMatcher, splitList } from '~/lib/utils/origin'

const ALLOWED_METHODS = 'GET, POST, PUT, PATCH, DELETE'

const ALLOWED_HEADERS = [
	'Authorization',
	'Content-Type',
	'Idempotency-Key',
	'X-Fingerprint-Event',
	'X-Request-Id'
].join(', ')

const EXPOSED_HEADERS = 'X-Request-Id'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export const CORS_ORIGINS = [
	...(env.CORS_ORIGIN ? splitList(env.CORS_ORIGIN) : [new URL(env.APP_URL).origin]),
	new URL(env.GATEWAY_URL).origin
]

export const isAllowedOrigin = createOriginMatcher(CORS_ORIGINS)

const preflight = (origin: string, requestedHeaders: string | null) =>
	new Response(null, {
		status: 204,
		headers: {
			'access-control-allow-origin': origin,
			'access-control-allow-credentials': 'true',
			'access-control-allow-methods': ALLOWED_METHODS,
			'access-control-allow-headers': ALLOWED_HEADERS,
			'access-control-max-age': String(env.CORS_MAX_AGE),
			vary: requestedHeaders
				? 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers'
				: 'Origin, Access-Control-Request-Method'
		}
	})

export const cors = new Elysia({ name: 'cors' }).onRequest(({ request, set }) => {
	const origin = request.headers.get('origin')

	if (!origin) {
		return
	}

	const allowed = isAllowedOrigin(origin)
	const isPreflight =
		request.method === 'OPTIONS' && request.headers.has('access-control-request-method')

	if (isPreflight) {
		return allowed
			? preflight(origin, request.headers.get('access-control-request-headers'))
			: new Response(null, { status: 403, headers: { vary: 'Origin' } })
	}

	set.headers.vary = 'Origin'

	if (!allowed) {
		if (!SAFE_METHODS.has(request.method)) {
			throw new ForbiddenError('Origin not allowed')
		}

		return
	}

	set.headers['access-control-allow-origin'] = origin
	set.headers['access-control-allow-credentials'] = 'true'
	set.headers['access-control-expose-headers'] = EXPOSED_HEADERS
})
