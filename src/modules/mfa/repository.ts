import { toBytes } from '~/lib/utils/bytes'
import { db } from '~/lib/db'

export const findTotpAuthenticator = (userId: string) =>
	db.totpAuthenticator.findUnique({ where: { userId } })

export const findAccountLabel = (userId: string) =>
	db.user.findUnique({ where: { id: userId }, select: { username: true, email: true } })

/** Starting over replaces an unfinished enrollment - the old QR code stops working. */
export const savePendingTotp = (userId: string, secretCipher: Buffer) =>
	db.totpAuthenticator.upsert({
		where: { userId },
		create: { userId, secretCipher: toBytes(secretCipher) },
		update: {
			secretCipher: toBytes(secretCipher),
			confirmedAt: null,
			lastUsedStep: null,
			lastUsedAt: null
		}
	})

export const enableTotp = (userId: string, step: number, recoveryCodeHashes: Buffer[]) =>
	db.$transaction(async (tx) => {
		const { count } = await tx.totpAuthenticator.updateMany({
			where: { userId, confirmedAt: null },
			data: { confirmedAt: new Date(), lastUsedStep: step, lastUsedAt: new Date() }
		})

		if (count === 0) {
			return false
		}

		await tx.recoveryCode.deleteMany({ where: { userId } })
		await tx.recoveryCode.createMany({
			data: recoveryCodeHashes.map((hash) => ({ userId, codeHash: toBytes(hash) }))
		})

		return true
	})

/** Compare-and-set on the step: of two requests racing with one code, only one wins. */
export const claimTotpStep = async (userId: string, step: number) => {
	const { count } = await db.totpAuthenticator.updateMany({
		where: {
			userId,
			confirmedAt: { not: null },
			OR: [{ lastUsedStep: null }, { lastUsedStep: { lt: step } }]
		},
		data: { lastUsedStep: step, lastUsedAt: new Date() }
	})

	return count === 1
}

/** Recovery codes go too unless another factor still needs them. */
export const removeTotp = (userId: string) =>
	db.$transaction(async (tx) => {
		await tx.totpAuthenticator.delete({ where: { userId } })

		const otherFactors = await tx.webAuthnCredential.count({ where: { userId } })

		if (otherFactors === 0) {
			await tx.recoveryCode.deleteMany({ where: { userId } })
		}
	})

export const replaceRecoveryCodes = (userId: string, hashes: Buffer[]) =>
	db.$transaction([
		db.recoveryCode.deleteMany({ where: { userId } }),
		db.recoveryCode.createMany({
			data: hashes.map((hash) => ({ userId, codeHash: toBytes(hash) }))
		})
	])

export const consumeRecoveryCode = async (userId: string, codeHash: Buffer) => {
	const { count } = await db.recoveryCode.updateMany({
		where: { userId, codeHash: toBytes(codeHash), usedAt: null },
		data: { usedAt: new Date() }
	})

	return count === 1
}

export const listRecoveryCodes = (userId: string) =>
	db.recoveryCode.findMany({
		where: { userId },
		select: { usedAt: true, createdAt: true }
	})

export const findMfaFactors = (userId: string) =>
	db.user.findUnique({
		where: { id: userId },
		select: {
			totpAuthenticator: { select: { confirmedAt: true } },
			_count: {
				select: { recoveryCodes: { where: { usedAt: null } }, webauthnCredentials: true }
			}
		}
	})
