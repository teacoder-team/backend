import { VerificationPurpose } from '@prisma/generated/client'

import { isProduction } from '~/config/env'
import { isDisposableEmail } from '~/lib/datasets/disposable-emails'
import { normalizeEmail } from '~/lib/utils/email'
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from '~/lib/errors'
import { extendLogContext } from '~/lib/logger'
import { orion } from '~/lib/integrations/orion'
import { redis } from '~/lib/redis'
import { encryptEmail, hashEmail } from '~/lib/security/email-crypto'
import { hashPassword, verifyPassword } from '~/lib/security/hash'
import { enqueueEmailChangeCode, enqueuePasswordChangeCode } from '~/modules/auth/jobs'
import {
	findPasswordCredential,
	findUserByEmailHash,
	updatePasswordHash,
	updateUserEmail
} from '~/modules/auth/repository'
import {
	getUserEmail,
	issueVerificationCode,
	VERIFICATION_TTL,
	verifyCode
} from '~/modules/auth/service'
import { issueTokenPair, type RequestOrigin, revokeAllSessions } from '~/modules/session/service'

import type {
	AvatarUploadInput,
	ChangeEmailInput,
	ChangePasswordInput,
	ConfirmCodeInput
} from './model'
import { findUserById, updateAvatar as updateAvatarRecord } from './repository'

const pendingEmailKey = (userId: string) => `pending_email_change:${userId}`
const pendingPasswordKey = (userId: string) => `pending_password_change:${userId}`

export const getCurrentUser = async (userId: string) => {
	const user = await findUserById(userId)

	if (!user) {
		throw new NotFoundError('User not found')
	}

	const email = await getUserEmail(userId)

	return {
		id: user.id,
		username: user.username,
		displayName: user.displayName,
		avatar: user.avatar,
		email,
		role: user.role,
		status: user.status,
		points: user.points,
		emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
		createdAt: user.createdAt.toISOString()
	}
}

export const requestEmailChange = async (userId: string, input: ChangeEmailInput) => {
	const newEmail = normalizeEmail(input.newEmail)

	if (await isDisposableEmail(newEmail)) {
		throw new BadRequestError('Temporary email addresses are not allowed')
	}

	const existing = await findUserByEmailHash(hashEmail(newEmail))

	if (existing && existing.id !== userId) {
		throw new ConflictError('Email already in use')
	}

	const code = await issueVerificationCode(userId, VerificationPurpose.EMAIL_CHANGE)

	await redis.set(pendingEmailKey(userId), newEmail, 'EX', VERIFICATION_TTL)
	await enqueueEmailChangeCode({ email: newEmail, code })

	extendLogContext({
		event: 'email_change_requested',
		userId,
		code: isProduction ? undefined : code
	})
}

export const confirmEmailChange = async (userId: string, input: ConfirmCodeInput) => {
	const pendingEmail = await redis.get(pendingEmailKey(userId))

	if (!pendingEmail) {
		throw new BadRequestError('Email change expired - start again')
	}

	await verifyCode(userId, VerificationPurpose.EMAIL_CHANGE, input.code, {
		expired: 'Email change expired - start again',
		invalid: 'Invalid confirmation code'
	})

	const { cipher, hash } = encryptEmail(pendingEmail)

	await updateUserEmail(userId, cipher, hash)
	await redis.del(pendingEmailKey(userId))

	extendLogContext({ event: 'email_change_completed', userId })

	return { email: pendingEmail }
}

export const requestPasswordChange = async (userId: string, input: ChangePasswordInput) => {
	const credential = await findPasswordCredential(userId)

	if (!credential || !(await verifyPassword(input.currentPassword, credential.passwordHash))) {
		throw new UnauthorizedError('Current password is incorrect')
	}

	const email = await getUserEmail(userId)

	if (!email) {
		throw new BadRequestError('This account has no email to send a confirmation code to')
	}

	const code = await issueVerificationCode(userId, VerificationPurpose.PASSWORD_CHANGE)
	const newPasswordHash = await hashPassword(input.newPassword)

	await redis.set(pendingPasswordKey(userId), newPasswordHash, 'EX', VERIFICATION_TTL)
	await enqueuePasswordChangeCode({ email, code })

	extendLogContext({
		event: 'password_change_requested',
		userId,
		code: isProduction ? undefined : code
	})
}

export const confirmPasswordChange = async (
	userId: string,
	input: ConfirmCodeInput,
	origin: RequestOrigin
) => {
	const newPasswordHash = await redis.get(pendingPasswordKey(userId))

	if (!newPasswordHash) {
		throw new BadRequestError('Password change expired - start again')
	}

	await verifyCode(userId, VerificationPurpose.PASSWORD_CHANGE, input.code, {
		expired: 'Password change expired - start again',
		invalid: 'Invalid confirmation code'
	})

	await updatePasswordHash(userId, newPasswordHash)
	await redis.del(pendingPasswordKey(userId))

	/** Confirmed change to the account's password - every other session should re-authenticate. */
	await revokeAllSessions(userId)

	extendLogContext({ event: 'password_change_completed', userId })

	return issueTokenPair(userId, origin)
}

export const updateAvatar = async (userId: string, input: AvatarUploadInput) => {
	const { url: avatar } = await orion.upload('avatars', input.file)

	await updateAvatarRecord(userId, avatar)

	extendLogContext({ event: 'avatar_updated', userId })

	return { avatar }
}
