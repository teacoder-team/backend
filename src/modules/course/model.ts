import { type Static, t } from 'elysia'

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

export type CourseSlugParamsInput = Static<typeof CourseSlugParams>
