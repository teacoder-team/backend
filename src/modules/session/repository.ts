import type { Prisma, RefreshToken, Session } from '@prisma/generated/client'

import { toBytes } from '~/lib/utils/bytes'
import { db } from '~/lib/db'

const active = (now: Date): Prisma.SessionWhereInput => ({
	revokedAt: null,
	expiresAt: { gt: now }
})

export interface NewSession {
	userId: string
	ip: string
	userAgent: string
	friendlyName: string | null
	visitorId: string | null
	country: string | null
	city: string | null
	browser: string | null
	os: string | null
	device: string | null
	expiresAt: Date
}

export const insertSession = (data: NewSession): Promise<Session> => db.session.create({ data })

export const findActiveSession = (sessionId: string) =>
	db.session.findFirst({ where: { id: sessionId, ...active(new Date()) } })

export const listActiveSessions = (userId: string) =>
	db.session.findMany({
		where: { userId, ...active(new Date()) },
		orderBy: { lastSeenAt: 'desc' }
	})

/** `exceptSessionId` keeps that one session out - "sign out everywhere else". */
export const listActiveSessionIds = async (userId: string, exceptSessionId?: string) => {
	const sessions = await db.session.findMany({
		where: { userId, id: { not: exceptSessionId }, ...active(new Date()) },
		select: { id: true }
	})

	return sessions.map(({ id }) => id)
}

export const revokeSessionById = async (userId: string, sessionId: string) => {
	const { count } = await db.session.updateMany({
		where: { id: sessionId, userId, ...active(new Date()) },
		data: { revokedAt: new Date() }
	})

	return count
}

export const revokeSessionsByUser = async (userId: string, exceptSessionId?: string) => {
	const { count } = await db.session.updateMany({
		where: { userId, id: { not: exceptSessionId }, ...active(new Date()) },
		data: { revokedAt: new Date() }
	})

	return count
}

export const touchSession = (sessionId: string, lastSeenAt: Date) =>
	db.session.update({ where: { id: sessionId }, data: { lastSeenAt } })

export const deleteSessionsDeadBefore = async (cutoff: Date) => {
	const { count } = await db.session.deleteMany({
		where: {
			OR: [{ expiresAt: { lt: cutoff } }, { revokedAt: { lt: cutoff } }]
		}
	})

	return count
}

export interface NewRefreshToken {
	sessionId: string
	familyId: string
	tokenHash: Buffer
	expiresAt: Date
}

export const createRefreshToken = (data: NewRefreshToken): Promise<RefreshToken> =>
	db.refreshToken.create({ data: { ...data, tokenHash: toBytes(data.tokenHash) } })

export const findRefreshTokenByHash = (tokenHash: Buffer) =>
	db.refreshToken.findUnique({ where: { tokenHash: toBytes(tokenHash) } })

export const rotateRefreshToken = (oldId: string, next: NewRefreshToken) =>
	db.$transaction(async (tx) => {
		const created = await tx.refreshToken.create({
			data: { ...next, tokenHash: toBytes(next.tokenHash) }
		})

		await tx.refreshToken.update({
			where: { id: oldId },
			data: { usedAt: new Date(), replacedById: created.id }
		})

		return created
	})

export const markRefreshTokenUsed = (id: string) =>
	db.refreshToken.update({ where: { id }, data: { usedAt: new Date() } })

export const deleteRefreshTokenFamily = async (familyId: string) => {
	const { count } = await db.refreshToken.deleteMany({ where: { familyId } })

	return count
}

/** True when the pair was not known yet. */
export const addUserVisitor = async (userId: string, visitorId: string) => {
	const { count } = await db.userVisitor.createMany({
		data: [{ userId, visitorId }],
		skipDuplicates: true
	})

	return count === 1
}

export const touchUserVisitor = (userId: string, visitorId: string) =>
	db.userVisitor.update({
		where: { userId_visitorId: { userId, visitorId } },
		data: { lastSeenAt: new Date() }
	})

export const countUserVisitors = (userId: string) => db.userVisitor.count({ where: { userId } })

export const findNewDeviceSession = (sessionId: string) =>
	db.session.findUnique({
		where: { id: sessionId },
		select: {
			ip: true,
			country: true,
			city: true,
			browser: true,
			os: true,
			createdAt: true,
			user: { select: { displayName: true, email: true } }
		}
	})
