import { Elysia } from 'elysia'

import { resolveSession } from '@/modules/session/service'
import { ErrorCode, UnauthorizedError } from '@/shared/errors'
import { verifyToken } from '@/shared/security/token'
import { SESSION_COOKIE } from './auth-cookie'

const BEARER_PREFIX = 'Bearer '

const readToken = (
	cookieToken: string | undefined,
	authorization: string | undefined,
) => {
	if (authorization?.startsWith(BEARER_PREFIX)) {
		return authorization.slice(BEARER_PREFIX.length)
	}

	return cookieToken
}

/**
 * Adds `auth: true` to any route. The handler then receives a `session` that
 * is guaranteed to still exist in Redis, so a revoked session stops working
 * immediately rather than at token expiry.
 */
export const authGuard = new Elysia({ name: 'auth-guard' }).macro({
	auth: {
		async resolve({ cookie, headers }) {
			const token = readToken(
				cookie[SESSION_COOKIE]?.value as string | undefined,
				headers.authorization,
			)

			if (!token) throw new UnauthorizedError('Authentication required')

			const payload = verifyToken(token)
			const session = await resolveSession(payload.sid)

			if (!session || session.userId !== payload.sub) {
				throw new UnauthorizedError(
					'Session expired or revoked',
					ErrorCode.SESSION_EXPIRED,
				)
			}

			return { session }
		},
	},
})
