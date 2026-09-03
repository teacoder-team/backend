import {
	AuthProvider,
	CredentialType,
	UserRole,
} from '@prisma/generated/client'

import { db } from '@/infra/db'

const PASSWORD_ALGORITHM = 'argon2'
const PASSWORD_VERSION = 1

/** Callers pass an already normalized address - see `normalizeEmail`. */
export const findCredentialByEmail = (email: string) =>
	db.credential.findUnique({
		where: {
			provider_identifier: {
				provider: AuthProvider.EMAIL,
				identifier: email,
			},
		},
		include: { user: true, passwordHash: true },
	})

/** The address the account signs in with, when it has one. */
export const findUserEmail = async (userId: string) => {
	const credential = await db.credential.findFirst({
		where: { userId, provider: AuthProvider.EMAIL },
		select: { identifier: true },
	})

	return credential?.identifier ?? null
}

export const emailExists = async (email: string) =>
	(await db.credential.count({
		where: { provider: AuthProvider.EMAIL, identifier: email },
	})) > 0

export interface CreateUserInput {
	email: string
	passwordHash: string
	displayName: string
	username: string
}

export const createUser = (input: CreateUserInput) =>
	db.$transaction(async (tx) => {
		const user = await tx.user.create({
			data: {
				username: input.username,
				displayName: input.displayName,
				role: UserRole.STUDENT,
			},
		})

		const credential = await tx.credential.create({
			data: {
				userId: user.id,
				provider: AuthProvider.EMAIL,
				type: CredentialType.PASSWORD,
				identifier: input.email,
			},
		})

		await tx.passwordHash.create({
			data: {
				credentialId: credential.id,
				hash: input.passwordHash,
				algorithm: PASSWORD_ALGORITHM,
				version: PASSWORD_VERSION,
			},
		})

		return user
	})
