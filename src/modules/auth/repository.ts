import { UserRole, UserStatus, VerificationPurpose } from '@prisma/generated/client'

import { toBytes } from '~/lib/utils/bytes'
import { db } from '~/lib/db'

/** Always normalized by the caller - the unique index is case-sensitive. */
export const findUserByEmail = (email: string) =>
	db.user.findUnique({ where: { email }, include: { passwordCredential: true } })

export const findUserEmail = async (userId: string) => {
	const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } })

	return user?.email ?? null
}

export interface CreatePendingUserInput {
	email: string
	passwordHash: string
	displayName: string
	username: string
}

export const createPendingUser = (input: CreatePendingUserInput) =>
	db.$transaction(async (tx) => {
		const user = await tx.user.create({
			data: {
				username: input.username,
				displayName: input.displayName,
				role: UserRole.STUDENT,
				email: input.email
			}
		})

		await tx.passwordCredential.create({
			data: { userId: user.id, passwordHash: input.passwordHash }
		})

		return user
	})

export const deletePendingUser = (userId: string) => db.user.delete({ where: { id: userId } })

export const activateUser = (userId: string) =>
	db.user.update({
		where: { id: userId },
		data: { status: UserStatus.ACTIVE, emailVerifiedAt: new Date() }
	})

export const updateLastLogin = (userId: string) =>
	db.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } })

export const updatePasswordHash = (userId: string, passwordHash: string) =>
	db.passwordCredential.update({
		where: { userId },
		data: { passwordHash, changedAt: new Date() }
	})

/** Creates the credential for accounts that signed up through a provider and never had a password. */
export const savePasswordHash = (userId: string, passwordHash: string) =>
	db.passwordCredential.upsert({
		where: { userId },
		create: { userId, passwordHash },
		update: { passwordHash, changedAt: new Date(), mustChange: false }
	})

export const findPasswordCredential = (userId: string) =>
	db.passwordCredential.findUnique({ where: { userId } })

export const updateUserEmail = (userId: string, email: string) =>
	db.user.update({
		where: { id: userId },
		data: { email, emailVerifiedAt: new Date() }
	})

export interface NewVerificationCode {
	userId: string
	purpose: VerificationPurpose
	codeHash: Buffer
	expiresAt: Date
}

export const createVerificationCode = (data: NewVerificationCode) =>
	db.verificationCode.create({ data: { ...data, codeHash: toBytes(data.codeHash) } })

export const findLatestVerificationCode = (userId: string, purpose: VerificationPurpose) =>
	db.verificationCode.findFirst({
		where: { userId, purpose, consumedAt: null },
		orderBy: { createdAt: 'desc' }
	})

export const consumeVerificationCode = (id: string) =>
	db.verificationCode.update({ where: { id }, data: { consumedAt: new Date() } })

export const incrementVerificationAttempts = (id: string) =>
	db.verificationCode.update({ where: { id }, data: { attempts: { increment: 1 } } })
