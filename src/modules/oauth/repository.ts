import { AuthProvider, UserRole, UserStatus } from '@prisma/generated/client'

import { db } from '~/infra/db'
import { toBytes } from '~/shared/bytes'

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
	emailCipher: Buffer | null
	emailHash: Buffer | null
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
				emailVerifiedAt: input.emailCipher ? new Date() : null,
				emailCipher: input.emailCipher ? toBytes(input.emailCipher) : null,
				emailHash: input.emailHash ? toBytes(input.emailHash) : null
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
