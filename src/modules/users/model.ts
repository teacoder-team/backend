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
				description:
					'Почта. `null` у аккаунтов, созданных через соцсеть без почты (Telegram).',
				examples: ['torvalds.l@teacoder.com']
			})
		),
		role: PrismaEnum(UserRole, {
			description: 'Роль на платформе.',
			examples: [UserRole.STUDENT]
		}),
		status: PrismaEnum(UserStatus, {
			description: 'Подтверждён ли аккаунт.',
			examples: [UserStatus.ACTIVE]
		}),
		points: t.Number({ description: 'Баллы за пройденные уроки.', examples: [120] }),
		hasPassword: t.Boolean({
			description:
				'Есть ли у аккаунта пароль. `false` у созданных через соцсеть - они могут установить его через `POST /users/@me/password/change` без текущего пароля.'
		}),
		isPremium: t.Boolean({
			description:
				'Действует ли премиум-подписка прямо сейчас. Подробности и автопродление - `GET /billing/subscription`.'
		}),
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

export const UpdateProfilePayload = t.Object(
	{
		displayName: t.String({
			minLength: 2,
			maxLength: 50,
			description: 'Отображаемое имя, от 2 до 50 символов. Пробелы по краям обрезаются.',
			error: 'Name must be between 2 and 50 characters',
			examples: ['Linus Torvalds']
		})
	},
	{ description: 'Изменения профиля.' }
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
		currentPassword: t.Optional(
			t.String({
				minLength: 1,
				description:
					'Текущий пароль. Обязателен, если пароль у аккаунта уже есть (`hasPassword` в профиле); у аккаунтов, созданных через соцсеть, его нет - поле не передаётся.',
				error: 'Current password must be a string',
				examples: ['oldpassword123']
			})
		),
		newPassword: t.String({
			minLength: 6,
			description: 'Новый пароль, не короче 6 символов.',
			error: 'Password must be at least 6 characters',
			examples: ['newpassword123']
		})
	},
	{ description: 'Новый пароль и, если он уже был, текущий.' }
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

export type UpdateProfileInput = Static<typeof UpdateProfilePayload>
export type ChangeEmailInput = Static<typeof ChangeEmailPayload>
export type ConfirmCodeInput = Static<typeof ConfirmCodePayload>
export type ChangePasswordInput = Static<typeof ChangePasswordPayload>
export type AvatarUploadInput = Static<typeof AvatarUploadPayload>

const Percent = (description: string) =>
	t.Number({ minimum: 0, maximum: 100, description, examples: [42] })

export const StatisticsResponse = t.Object(
	{
		points: t.Number({ description: 'Баллы за пройденные уроки.', examples: [120] }),
		rank: t.Number({
			description:
				'Место в общем рейтинге по баллам (1 - первое). При равных баллах места одинаковые, заблокированные в рейтинге не участвуют.',
			examples: [7]
		}),
		completedLessons: t.Number({ description: 'Пройдено уроков.', examples: [24] }),
		totalLessons: t.Number({
			description: 'Всего уроков на платформе (опубликованных, в опубликованных курсах).',
			examples: [120]
		}),
		progress: Percent('Доля пройденных уроков от всех, в процентах.'),
		completedCourses: t.Number({
			description: 'Курсов, в которых пройдены все уроки.',
			examples: [2]
		}),
		coursesInProgress: t.Number({
			description: 'Курсов, начатых, но не законченных.',
			examples: [1]
		})
	},
	{ description: 'Статистика обучения текущего пользователя.' }
)

export const CourseProgressItem = t.Object(
	{
		id: t.String({
			description: 'Идентификатор курса.',
			examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d']
		}),
		title: t.String({ description: 'Название курса.', examples: ['Основы TypeScript'] }),
		slug: t.String({
			description: 'Идентификатор курса для URL.',
			examples: ['osnovy-typescript']
		}),
		thumbnail: t.Nullable(
			t.String({
				description: 'Обложка курса.',
				examples: ['https://orion.teacoder.ru/courses/Q2J4N7SP7OJLZFFJ']
			})
		),
		totalLessons: t.Number({ description: 'Опубликованных уроков в курсе.', examples: [20] }),
		completedLessons: t.Number({ description: 'Из них пройдено.', examples: [5] }),
		progress: Percent('Прогресс по курсу в процентах.'),
		nextLesson: t.Nullable(
			t.Object(
				{
					id: t.String({ examples: ['550e8400-e29b-41d4-a716-446655440000'] }),
					title: t.String({ examples: ['Переменные и типы'] }),
					slug: t.String({ examples: ['peremennye-i-tipy'] }),
					position: t.Number({ examples: [6] })
				},
				{
					description:
						'С какого урока продолжить - первый непройденный по порядку. `null`, если курс пройден целиком.'
				}
			)
		),
		lastActivityAt: t.Nullable(
			t.String({
				description: 'Когда последний раз отмечался урок этого курса.',
				examples: ['2026-09-30T14:16:54.000Z']
			})
		)
	},
	{ description: 'Прогресс по одному курсу.' }
)

export const CourseProgressListResponse = t.Array(CourseProgressItem, {
	description:
		'Курсы, в которых пройден хотя бы один урок, - сначала те, которыми занимались последними.'
})

export const LeaderResponse = t.Object(
	{
		id: t.String({
			description: 'Идентификатор пользователя.',
			examples: ['49003cb8-7f31-4942-abec-ac9e29318681']
		}),
		rank: t.Number({
			description: 'Место в рейтинге. При равных баллах места одинаковые.',
			examples: [1]
		}),
		displayName: t.String({ description: 'Отображаемое имя.', examples: ['Linus Torvalds'] }),
		avatar: t.Nullable(
			t.String({
				description: 'Ссылка на аватар.',
				examples: ['https://orion.teacoder.ru/avatars/Q2J4N7SP7OJLZFFJ']
			})
		),
		points: t.Number({ description: 'Баллы.', examples: [1240] }),
		isPremium: t.Boolean({ description: 'Действует ли у пользователя премиум.' })
	},
	{ description: 'Строка рейтинга.' }
)

export const LeaderListResponse = t.Array(LeaderResponse, {
	description: 'Топ-15 пользователей по баллам, без заблокированных.'
})
