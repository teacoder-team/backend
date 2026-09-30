import { type Static, t } from 'elysia'

import { LessonAccess } from '@prisma/generated/client'

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

export const CourseListItem = t.Object(
	{
		id: CourseId,
		title: CourseTitle,
		slug: CourseSlug,
		shortDescription: CourseShortDescription,
		thumbnail: CourseThumbnail,
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
		price: t.Nullable(
			t.Number({
				description:
					'Цена разовой покупки в рублях. `null` - курс доступен только по подписке.',
				examples: [1990]
			})
		),
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
		position: t.Number({ description: 'Порядковый номер в курсе.', examples: [1] }),
		access: PrismaEnum(LessonAccess, {
			description:
				'`FREE` - открыт всем, `PREMIUM` - нужна подписка или покупка курса.',
			examples: [LessonAccess.FREE]
		})
	},
	{ description: 'Урок в программе курса.' }
)

export const CourseLessonListResponse = t.Array(CourseLessonListItem, {
	description: 'Уроки курса по порядку.'
})

export type CourseSlugParamsInput = Static<typeof CourseSlugParams>
