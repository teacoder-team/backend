import { Elysia } from 'elysia'

import { extendLogContext } from '~/infra/logger'
import { resolveSession } from '~/modules/session/service'
import { UnauthorizedError } from '~/shared/errors'
import { verifyToken } from '~/shared/security/token'

import { SESSION_COOKIE } from './auth-cookie'

const BEARER_PREFIX = 'Bearer '

const readToken = (cookieToken: string | undefined, authorization: string | undefined) => {
	if (authorization?.startsWith(BEARER_PREFIX)) {
		return authorization.slice(BEARER_PREFIX.length)
	}

	return cookieToken
}

export const authGuard = new Elysia({ name: 'auth-guard' }).macro({
	auth: {
		async resolve({ cookie, headers }) {
			const token = readToken(
				cookie[SESSION_COOKIE]?.value as string | undefined,
				headers.authorization
			)

			if (!token) throw new UnauthorizedError('Authentication required')

			const payload = verifyToken(token)
			const session = await resolveSession(payload.sid)

			if (!session || session.userId !== payload.sub) {
				throw new UnauthorizedError('Session expired or revoked')
			}

			extendLogContext({ userId: session.userId })

			return { session }
		}
	}
})
