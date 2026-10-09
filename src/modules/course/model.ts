import { type Static, t } from 'elysia'

import { CourseAccessMode, LessonAccess } from '@prisma/generated/client'

import { PrismaEnum } from '~/lib/utils/schema'

const CourseId = t.String({
	description: 'Идентификатор курса.',
	examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d']
})

const CourseTitle = t.String({ description: 'Название курса.', examples: ['Основы TypeScript'] })

const CourseSlug = t.String({
	description: 'Идентификатор курса для URL.',
	examples: ['osnovy-typescript']
})

const CourseShortDescription = t.Nullable(
	t.String({
		description: 'Краткое описание для карточки.',
		examples: ['Погружение в типизацию с нуля']
	})
)

const CourseThumbnail = t.Nullable(
	t.String({
		description: 'Обложка курса.',
		examples: ['https://orion.teacoder.ru/courses/Q2J4N7SP7OJLZFFJLTCAQ3GGO5']
	})
)

const CoursePrice = t.Nullable(
	t.Number({
		description:
			'Цена разовой покупки в рублях, если курс платный. `null` - бесплатный курс (платные уроки в нём, если есть, открываются подпиской).',
		examples: [1990]
	})
)

const CourseAccessModeSchema = PrismaEnum(CourseAccessMode, {
	description:
		'Как открываются закрытые уроки и материалы: `FREE` - курс полностью бесплатный, `PREMIUM` - по премиум-подписке или покупке курса, `PURCHASE` - только покупкой. Купленный курс открыт навсегда в любом режиме.',
	examples: [CourseAccessMode.PREMIUM]
})

const HasMaterials = t.Boolean({
	description:
		'Есть ли у курса материалы (исходный код). Скачать - `POST /courses/{slug}/materials/link`.'
})

export const CourseListItem = t.Object(
	{
		id: CourseId,
		title: CourseTitle,
		slug: CourseSlug,
		shortDescription: CourseShortDescription,
		thumbnail: CourseThumbnail,
		price: CoursePrice,
		accessMode: CourseAccessModeSchema,
		hasMaterials: HasMaterials,
		lessons: t.Number({ description: 'Количество опубликованных уроков.', examples: [10] })
	},
	{ description: 'Карточка курса в каталоге.' }
)

export const CourseListResponse = t.Array(CourseListItem, {
	description: 'Опубликованные курсы.'
})

export const CourseSlugParams = t.Object({
	slug: CourseSlug
})

export const CourseAccessResponse = t.Object(
	{
		hasAccess: t.Boolean({
			description: 'Открыты ли текущему пользователю закрытые уроки и материалы курса.'
		}),
		via: t.Nullable(
			t.UnionEnum(['FREE', 'PURCHASE', 'PREMIUM'], {
				description:
					'Почему открыт: `FREE` - курс бесплатный, `PURCHASE` - курс куплен, `PREMIUM` - по подписке. `null` - закрыт.',
				examples: ['PREMIUM']
			})
		)
	},
	{
		description:
			'Доступ текущего пользователя. Без входа открыт только бесплатный курс (ознакомительные уроки открыты всем в любом случае).'
	}
)

export const CourseResponse = t.Object(
	{
		id: CourseId,
		title: CourseTitle,
		slug: CourseSlug,
		shortDescription: CourseShortDescription,
		fullDescription: t.Nullable(
			t.String({ description: 'Полное описание для страницы курса.' })
		),
		thumbnail: CourseThumbnail,
		youtubeUrl: t.Nullable(
			t.String({
				description: 'Ссылка на видео курса на YouTube.',
				examples: ['https://youtube.com/watch?v=...']
			})
		),
		price: CoursePrice,
		accessMode: CourseAccessModeSchema,
		hasMaterials: HasMaterials,
		access: CourseAccessResponse,
		views: t.Number({ description: 'Сколько раз открывали страницу курса.', examples: [4213] })
	},
	{ description: 'Курс.' }
)

export const CourseLessonListItem = t.Object(
	{
		id: t.String({
			description: 'Идентификатор урока.',
			examples: ['550e8400-e29b-41d4-a716-446655440000']
		}),
		title: t.String({ description: 'Название урока.', examples: ['Переменные и типы'] }),
		slug: t.String({
			description: 'Идентификатор урока для URL.',
			examples: ['peremennye-i-tipy']
		}),
		description: t.Nullable(
			t.String({
				description: 'Описание урока.',
				examples: ['Разбираем базовые типы данных на примерах.']
			})
		),
		position: t.Number({ description: 'Порядковый номер в курсе.', examples: [1] }),
		access: PrismaEnum(LessonAccess, {
			description:
				'`FREE` - ознакомительный, открыт всем. `PREMIUM` - открывается вместе с курсом (см. `accessMode` курса). В бесплатном курсе открыты все уроки.',
			examples: [LessonAccess.FREE]
		}),
		isLocked: t.Boolean({
			description:
				'Закрыт ли урок для текущего пользователя - `GET /lessons/{id}` ответит 403. Без входа закрыты все уроки `PREMIUM` платного курса.'
		})
	},
	{ description: 'Урок в программе курса.' }
)

export const CourseLessonListResponse = t.Array(CourseLessonListItem, {
	description: 'Уроки курса по порядку.'
})

export type CourseSlugParamsInput = Static<typeof CourseSlugParams>

export const MaterialsLinkResponse = t.Object(
	{
		url: t.String({
			description:
				'Ссылка на архив с материалами - откройте её в браузере, начнётся скачивание. Действует 5 минут.',
			examples: [
				'https://api.teacoder.ru/downloads/q2fSx1Gd0Yk7uJ9ZlQm3cW8vB4nR6tHpE5aT1oKyL0s'
			]
		}),
		expiresIn: t.Number({
			description: 'Через сколько секунд ссылка перестанет работать.',
			examples: [300]
		})
	},
	{ description: 'Временная ссылка на материалы курса.' }
)

export const DownloadParams = t.Object({
	token: t.String({
		pattern: '^[A-Za-z0-9_-]{43}$',
		description: 'Токен из ссылки на материалы.',
		error: 'Invalid download token'
	})
})

export type CourseAccessSource = 'FREE' | 'PURCHASE' | 'PREMIUM'

export interface CourseEntitlement {
	hasAccess: boolean

	via: CourseAccessSource | null
}

export interface GatedCourse {
	id: string
	accessMode: CourseAccessMode
}
