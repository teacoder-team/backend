import { type Static, t } from 'elysia'

import { UserRole, UserStatus } from '@prisma/generated/client'

import { PrismaEnum } from '~/shared/api'

export const UserResponse = t.Object({
	id: t.String({ examples: ['49003cb8-7f31-4942-abec-ac9e29318681'] }),
	username: t.String({ examples: ['a16cefd8c31fca86'] }),
	displayName: t.String({ examples: ['Linus Torvalds'] }),
	avatar: t.Nullable(t.String({ examples: ['https://cdn.teacoder.ru/avatars/1.png'] })),
	email: t.Nullable(t.String({ format: 'email', examples: ['torvalds.l@teacoder.com'] })),
	role: PrismaEnum(UserRole, { examples: [UserRole.STUDENT] }),
	status: PrismaEnum(UserStatus, { examples: [UserStatus.ACTIVE] }),
	points: t.Number({ examples: [120] }),
	emailVerifiedAt: t.Nullable(t.String({ examples: ['2026-07-04T14:16:54.000Z'] })),
	createdAt: t.String({ examples: ['2026-07-04T14:16:54.000Z'] })
})

export const ChangeEmailPayload = t.Object({
	newEmail: t.String({
		format: 'email',
		error: 'Invalid email format',
		examples: ['new.email@teacoder.com']
	})
})

export const ConfirmCodePayload = t.Object({
	code: t.String({
		minLength: 6,
		maxLength: 6,
		error: 'Code must be exactly 6 characters',
		examples: ['123456']
	})
})

export const ChangePasswordPayload = t.Object({
	currentPassword: t.String({
		minLength: 6,
		error: 'Current password is required',
		examples: ['oldpassword123']
	}),
	newPassword: t.String({
		minLength: 6,
		error: 'Password must be at least 6 characters',
		examples: ['newpassword123']
	})
})

export const EmailChangeResponse = t.Object({
	email: t.String({ format: 'email', examples: ['new.email@teacoder.com'] })
})

export const AvatarUploadPayload = t.Object({
	file: t.File({ type: 'image', maxSize: '5m' })
})

export const AvatarResponse = t.Object({
	avatar: t.String({ examples: ['https://cdn.teacoder.ru/avatars/1a2b3c.png'] })
})

export type ChangeEmailInput = Static<typeof ChangeEmailPayload>
export type ConfirmCodeInput = Static<typeof ConfirmCodePayload>
export type ChangePasswordInput = Static<typeof ChangePasswordPayload>
export type AvatarUploadInput = Static<typeof AvatarUploadPayload>
