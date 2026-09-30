import { type Static, t } from 'elysia'

import { UserRole, UserStatus } from '@prisma/generated/client'

import { PrismaEnum } from '~/lib/utils/schema'

export const UserResponse = t.Object(
	{
		id: t.String({
			description: 'Идентификатор пользователя.',
			examples: ['49003cb8-7f31-4942-abec-ac9e29318681']
		}),
		username: t.String({
			description: 'Уникальное имя пользователя.',
			examples: ['a16cefd8c31fca86']
		}),
		displayName: t.String({ description: 'Отображаемое имя.', examples: ['Linus Torvalds'] }),
		avatar: t.Nullable(
			t.String({
				description: 'Ссылка на аватар.',
				examples: ['https://orion.teacoder.ru/avatars/Q2J4N7SP7OJLZFFJ']
			})
		),
		email: t.Nullable(
			t.String({
				format: 'email',
				description: 'Почта. `null` у аккаунтов, созданных через соцсеть без почты (Telegram).',
				examples: ['torvalds.l@teacoder.com']
			})
		),
		role: PrismaEnum(UserRole, { description: 'Роль на платформе.', examples: [UserRole.STUDENT] }),
		status: PrismaEnum(UserStatus, {
			description: 'Подтверждён ли аккаунт.',
			examples: [UserStatus.ACTIVE]
		}),
		points: t.Number({ description: 'Баллы за пройденные уроки.', examples: [120] }),
		emailVerifiedAt: t.Nullable(
			t.String({
				description: 'Когда почта подтверждена.',
				examples: ['2026-07-04T14:16:54.000Z']
			})
		),
		createdAt: t.String({
			description: 'Дата регистрации.',
			examples: ['2026-07-04T14:16:54.000Z']
		})
	},
	{ description: 'Профиль пользователя.' }
)

export const ChangeEmailPayload = t.Object(
	{
		newEmail: t.String({
			format: 'email',
			description: 'Новый адрес - на него придёт код подтверждения.',
			error: 'Invalid email format',
			examples: ['new.email@teacoder.com']
		})
	},
	{ description: 'Новая почта.' }
)

export const ConfirmCodePayload = t.Object(
	{
		code: t.String({
			minLength: 6,
			maxLength: 6,
			description: '6-значный код из письма.',
			error: 'Code must be exactly 6 characters',
			examples: ['123456']
		})
	},
	{ description: 'Код подтверждения.' }
)

export const ChangePasswordPayload = t.Object(
	{
		currentPassword: t.String({
			minLength: 6,
			description: 'Текущий пароль.',
			error: 'Current password is required',
			examples: ['oldpassword123']
		}),
		newPassword: t.String({
			minLength: 6,
			description: 'Новый пароль, не короче 6 символов.',
			error: 'Password must be at least 6 characters',
			examples: ['newpassword123']
		})
	},
	{ description: 'Текущий и новый пароль.' }
)

export const EmailChangeResponse = t.Object(
	{
		email: t.String({
			format: 'email',
			description: 'Новая почта аккаунта.',
			examples: ['new.email@teacoder.com']
		})
	},
	{ description: 'Почта после смены.' }
)

export const AvatarUploadPayload = t.Object(
	{
		file: t.File({
			type: 'image',
			maxSize: '5m',
			description: 'Изображение до 5 МБ.'
		})
	},
	{ description: 'Файл нового аватара.' }
)

export const AvatarResponse = t.Object(
	{
		avatar: t.String({
			description: 'Ссылка на новый аватар.',
			examples: ['https://orion.teacoder.ru/avatars/Q2J4N7SP7OJLZFFJ']
		})
	},
	{ description: 'Обновлённый аватар.' }
)

export type ChangeEmailInput = Static<typeof ChangeEmailPayload>
export type ConfirmCodeInput = Static<typeof ConfirmCodePayload>
export type ChangePasswordInput = Static<typeof ChangePasswordPayload>
export type AvatarUploadInput = Static<typeof AvatarUploadPayload>
