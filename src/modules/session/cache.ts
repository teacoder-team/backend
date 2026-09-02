import type { Session } from '@prisma/generated/client'

import { env } from '@/config/env'
import { cache } from '@/infra/cache'

const MISS_TTL = 30

export interface CachedSession {
	id: string
	userId: string
	expiresAt: string
	lastSeenAt: string
}

const key = (sessionId: string) => `session:${sessionId}`

export const toCachedSession = (session: Session): CachedSession => ({
	id: session.id,
	userId: session.userId,
	expiresAt: session.expiresAt.toISOString(),
	lastSeenAt: session.lastSeenAt.toISOString(),
})

const ttlFor = ({ expiresAt }: CachedSession) => {
	const remaining = (Date.parse(expiresAt) - Date.now()) / 1000

	return Math.min(env.SESSION_CACHE_TTL, remaining)
}

export const readCachedSession = (
	sessionId: string,
	load: () => Promise<CachedSession | null>,
) =>
	cache.readThrough<CachedSession>(
		key(sessionId),
		{ ttl: ttlFor, missTtl: MISS_TTL },
		load,
	)

export const writeCachedSession = (session: CachedSession) =>
	cache.write(key(session.id), session, ttlFor(session))

export const dropCachedSessions = (...sessionIds: string[]) =>
	cache.drop(...sessionIds.map(key))
