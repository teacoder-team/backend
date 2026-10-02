import type { WebAuthnDeviceType } from '@prisma/generated/client'

import { toBytes } from '~/lib/utils/bytes'
import { db } from '~/lib/db'

export const findRegistrationSubject = (userId: string) =>
	db.user.findUnique({
		where: { id: userId },
		select: {
			username: true,
			displayName: true,
			email: true,
			webauthnCredentials: { select: { credentialId: true, transports: true } }
		}
	})

export interface NewWebAuthnCredential {
	userId: string
	credentialId: Buffer
	publicKey: Uint8Array
	signCount: number
	transports: string[]
	aaguid: string | null
	deviceType: WebAuthnDeviceType
	backedUp: boolean
	name: string
}

export const createWebAuthnCredential = ({
	credentialId,
	publicKey,
	signCount,
	...data
}: NewWebAuthnCredential) =>
	db.webAuthnCredential.create({
		data: {
			...data,
			credentialId: toBytes(credentialId),
			publicKey: toBytes(Buffer.from(publicKey)),
			signCount: BigInt(signCount)
		}
	})

export const findWebAuthnCredential = (credentialId: Buffer) =>
	db.webAuthnCredential.findUnique({ where: { credentialId: toBytes(credentialId) } })

export const listWebAuthnCredentials = (userId: string) =>
	db.webAuthnCredential.findMany({
		where: { userId },
		orderBy: { createdAt: 'asc' }
	})

/** Compare-and-set, so a cloned key racing the real one can't slip a stale counter past the check. */
export const recordWebAuthnUse = async (
	id: string,
	previousCount: bigint,
	nextCount: number,
	backedUp: boolean
) => {
	const { count } = await db.webAuthnCredential.updateMany({
		where: { id, signCount: previousCount },
		data: { signCount: BigInt(nextCount), backedUp, lastUsedAt: new Date() }
	})

	return count === 1
}

/** Recovery codes go too once no second factor is left to recover. */
export const deleteWebAuthnCredential = (userId: string, id: string) =>
	db.$transaction(async (tx) => {
		const { count } = await tx.webAuthnCredential.deleteMany({ where: { id, userId } })

		if (count === 0) {
			return false
		}

		const [keysLeft, totp] = await Promise.all([
			tx.webAuthnCredential.count({ where: { userId } }),
			tx.totpAuthenticator.findUnique({ where: { userId }, select: { confirmedAt: true } })
		])

		if (keysLeft === 0 && !totp?.confirmedAt) {
			await tx.recoveryCode.deleteMany({ where: { userId } })
		}

		return true
	})
