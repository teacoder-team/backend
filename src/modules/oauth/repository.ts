import { AuthProvider, CredentialType, UserRole } from '@prisma/generated/client'

import { db } from '~/infra/db'

export const findIdentity = (provider: AuthProvider, providerAccountId: string) =>
	db.credential.findUnique({
		where: { provider_identifier: { provider, identifier: providerAccountId } },
		include: { user: true }
	})

export const linkIdentity = (userId: string, provider: AuthProvider, providerAccountId: string) =>
	db.credential.create({
		data: { userId, provider, type: CredentialType.OAUTH, identifier: providerAccountId }
	})

export interface CreateOAuthUserInput {
	provider: AuthProvider
	providerAccountId: string
	displayName: string
	username: string
	avatar: string | null
}

export const createOAuthUser = (input: CreateOAuthUserInput) =>
	db.$transaction(async (tx) => {
		const user = await tx.user.create({
			data: {
				username: input.username,
				displayName: input.displayName,
				avatar: input.avatar,
				role: UserRole.STUDENT
			}
		})

		await tx.credential.create({
			data: {
				userId: user.id,
				provider: input.provider,
				type: CredentialType.OAUTH,
				identifier: input.providerAccountId
			}
		})

		return user
	})
