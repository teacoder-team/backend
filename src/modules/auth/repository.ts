import { UserRole, UserStatus, VerificationPurpose } from '@prisma/generated/client'

import { db } from '~/infra/db'
import { toBytes } from '~/shared/bytes'

export const findUserByEmailHash = (emailHash: Buffer) =>
	db.user.findUnique({
		where: { emailHash: toBytes(emailHash) },
		include: { passwordCredential: true }
	})

export const findEmailCipher = async (userId: string) => {
	const user = await db.user.findUnique({ where: { id: userId }, select: { emailCipher: true } })

	return user?.emailCipher ?? null
}

export interface CreatePendingUserInput {
	emailCipher: Buffer
	emailHash: Buffer
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
				emailCipher: toBytes(input.emailCipher),
				emailHash: toBytes(input.emailHash)
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
