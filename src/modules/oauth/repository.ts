import { AuthProvider, UserRole, UserStatus } from '@prisma/generated/client'

import { db } from '~/lib/db'

export const findOAuthAccount = (provider: AuthProvider, providerAccountId: string) =>
	db.oAuthAccount.findUnique({
		where: { provider_providerAccountId: { provider, providerAccountId } },
		include: { user: true }
	})

export const linkOAuthAccount = (
	userId: string,
	provider: AuthProvider,
	providerAccountId: string
) => db.oAuthAccount.create({ data: { userId, provider, providerAccountId } })

export interface CreateOAuthUserInput {
	provider: AuthProvider
	providerAccountId: string
	displayName: string
	username: string
	avatar: string | null
	/** Present when the provider returned a verified email (not all do, e.g. Telegram). */
	email: string | null
}

export const createOAuthUser = (input: CreateOAuthUserInput) =>
	db.$transaction(async (tx) => {
		const user = await tx.user.create({
			data: {
				username: input.username,
				displayName: input.displayName,
				avatar: input.avatar,
				role: UserRole.STUDENT,
				status: UserStatus.ACTIVE,
				emailVerifiedAt: input.email ? new Date() : null,
				email: input.email
			}
		})

		await tx.oAuthAccount.create({
			data: {
				userId: user.id,
				provider: input.provider,
				providerAccountId: input.providerAccountId
			}
		})

		return user
	})

export const findUserOAuthAccount = (userId: string, provider: AuthProvider) =>
	db.oAuthAccount.findUnique({ where: { userId_provider: { userId, provider } } })

export const listUserOAuthAccounts = (userId: string) =>
	db.oAuthAccount.findMany({
		where: { userId },
		select: { provider: true, linkedAt: true }
	})

export const unlinkOAuthAccount = async (userId: string, provider: AuthProvider) => {
	const { count } = await db.oAuthAccount.deleteMany({ where: { userId, provider } })

	return count
}

export const findSignInMethods = (userId: string) =>
	db.user.findUnique({
		where: { id: userId },
		select: {
			passwordCredential: { select: { userId: true } },
			_count: { select: { oauthAccounts: true } }
		}
	})

export const findLinkNotificationTarget = (userId: string) =>
	db.user.findUnique({
		where: { id: userId },
		select: { displayName: true, email: true }
	})
