import { Elysia } from 'elysia'

import { UserRole } from '@prisma/generated/client'

import { ForbiddenError, UnauthorizedError } from '~/lib/errors'
import { extendLogContext } from '~/lib/logger'
import { verifyAccessToken } from '~/lib/security/jwt'
import { resolveSession } from '~/modules/session/service'
import { findUserRole } from '~/modules/users/repository'

const BEARER_PREFIX = 'Bearer '

export const readBearerToken = (authorization: string | undefined) => {
	if (!authorization?.startsWith(BEARER_PREFIX)) {
		return undefined
	}

	return authorization.slice(BEARER_PREFIX.length)
}

const requireSession = async (authorization: string | undefined) => {
	const token = readBearerToken(authorization)

	if (!token) {
		throw new UnauthorizedError('Authentication required')
	}

	const payload = await verifyAccessToken(token)
	const session = await resolveSession(payload.sid)

	if (!session || session.userId !== payload.sub) {
		throw new UnauthorizedError('Session expired or revoked')
	}

	extendLogContext({ userId: session.userId })

	return session
}

export const authGuard = new Elysia({ name: 'auth-guard' }).macro({
	auth: {
		async resolve({ headers }) {
			return { session: await requireSession(headers.authorization) }
		}
	},
	admin: {
		async resolve({ headers }) {
			const session = await requireSession(headers.authorization)

			if ((await findUserRole(session.userId)) !== UserRole.ADMIN) {
				throw new ForbiddenError('Administrator access required')
			}

			return { session }
		}
	}
})

export const optionalAuth = new Elysia({ name: 'optional-auth' }).derive(
	{ as: 'global' },
	async ({ headers }) => {
		const token = readBearerToken(headers.authorization)

		if (!token) {
			return { optionalSession: null }
		}

		const payload = await verifyAccessToken(token)
		const session = await resolveSession(payload.sid)

		if (!session || session.userId !== payload.sub) {
			throw new UnauthorizedError('Session expired or revoked')
		}

		extendLogContext({ userId: session.userId })

		return { optionalSession: session }
	}
)
