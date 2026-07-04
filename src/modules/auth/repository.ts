import { db } from '@/core/database'
import {
	AuthProvider,
	CredentialType,
	UserRole,
} from '@prisma/generated/client'

export async function findByEmail(email: string) {
	return db.credential.findUnique({
		where: {
			provider_identifier: {
				provider: AuthProvider.EMAIL,
				identifier: email.toLowerCase(),
			},
		},
		include: {
			user: true,
			passwordHash: true,
		},
	})
}

export async function exists(email: string): Promise<boolean> {
	const count = await db.credential.count({
		where: {
			provider: AuthProvider.EMAIL,
			identifier: email.toLowerCase(),
		},
	})

	return count > 0
}

export async function createAuthUser(data: {
	email: string
	passwordHash: string
	displayName: string
	username: string
}) {
	return db.$transaction(async (tx) => {
		const user = await tx.user.create({
			data: {
				role: UserRole.STUDENT,
			},
		})

		await tx.profile.create({
			data: {
				userId: user.id,
				username: data.username,
				displayName: data.displayName,
			},
		})

		const credential = await tx.credential.create({
			data: {
				userId: user.id,
				provider: AuthProvider.EMAIL,
				type: CredentialType.PASSWORD,
				identifier: data.email.toLowerCase(),
			},
		})

		await tx.passwordHash.create({
			data: {
				credentialId: credential.id,
				hash: data.passwordHash,
				algorithm: 'argon2',
				version: 1,
			},
		})

		return user
	})
}
