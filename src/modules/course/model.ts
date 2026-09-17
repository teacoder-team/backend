import { type Static, t } from 'elysia'

import { LessonAccess } from '@prisma/generated/client'

import { PrismaEnum } from '~/shared/api'

const CourseId = t.String({
	description: 'Unique identifier of the course.',
	examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d']
})

const CourseTitle = t.String({ examples: ['Основы TypeScript'] })

const CourseSlug = t.String({
	description: 'URL-friendly course identifier.',
	examples: ['osnovy-typescript']
})

const CourseShortDescription = t.Nullable(t.String({ examples: ['Погружение в типизацию с нуля'] }))

const CourseThumbnail = t.Nullable(
	t.String({
		description: 'Cover image shown in course cards.',
		examples: ['https://cdn.teacoder.ru/courses/typescript.png']
	})
)

export const CourseListItem = t.Object({
	id: CourseId,
	title: CourseTitle,
	slug: CourseSlug,
	shortDescription: CourseShortDescription,
	thumbnail: CourseThumbnail,
	lessons: t.Number({ description: 'Number of published lessons.', examples: [10] })
})

export const CourseListResponse = t.Array(CourseListItem)

export const CourseSlugParams = t.Object({
	slug: CourseSlug
})

export const CourseResponse = t.Object({
	id: CourseId,
	title: CourseTitle,
	slug: CourseSlug,
	shortDescription: CourseShortDescription,
	fullDescription: t.Nullable(
		t.String({
			description: 'Full course description, rendered on the course page.'
		})
	),
	thumbnail: CourseThumbnail,
	youtubeUrl: t.Nullable(
		t.String({
			description: 'YouTube URL for course content.',
			examples: ['https://youtube.com/watch?v=...']
		})
	),
	price: t.Nullable(
		t.Number({
			description:
				'One-time purchase price in RUB. Null when only available via subscription.',
			examples: [1990]
		})
	),
	views: t.Number({ description: 'How many times the course page was opened.', examples: [4213] })
})

export const CourseLessonListItem = t.Object({
	id: t.String({
		description: 'Unique identifier of the lesson.',
		examples: ['550e8400-e29b-41d4-a716-446655440000']
	}),
	title: t.String({ examples: ['Переменные и типы'] }),
	slug: t.String({ examples: ['peremennye-i-tipy'] }),
	position: t.Number({ description: 'Order of the lesson within the course.', examples: [1] }),
	access: PrismaEnum(LessonAccess, {
		description: 'FREE lessons are open to everyone, PREMIUM ones require access.',
		examples: [LessonAccess.FREE]
	})
})

export const CourseLessonListResponse = t.Array(CourseLessonListItem)

export type CourseSlugParamsInput = Static<typeof CourseSlugParams>
