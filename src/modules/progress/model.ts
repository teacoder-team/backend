import { type Static, t } from 'elysia'

export const CourseIdParams = t.Object({
	courseId: t.String({
		description: 'Unique identifier of the course.',
		examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d']
	})
})

export const CourseProgressResponse = t.Object({
	totalLessons: t.Number({ description: 'Published lessons in the course.', examples: [20] }),
	completedLessons: t.Number({ examples: [5] }),
	percentage: t.Number({
		description: 'Rounded percentage of published lessons completed.',
		examples: [25]
	}),
	completedLessonIds: t.Array(t.String(), {
		description: 'Ids of every lesson the user has marked complete.'
	})
})

export const UpdateProgressPayload = t.Object({
	lessonId: t.String({ examples: ['550e8400-e29b-41d4-a716-446655440000'] }),
	isCompleted: t.Boolean({ examples: [true] })
})

export const UpdateProgressResponse = t.Object({
	isCompleted: t.Boolean({ examples: [true] }),
	nextLessonId: t.Nullable(
		t.String({
			description: 'The next lesson in the course, or null if this was the last one.',
			examples: ['550e8400-e29b-41d4-a716-446655440001']
		})
	)
})

export type CourseIdParamsInput = Static<typeof CourseIdParams>
export type UpdateProgressInput = Static<typeof UpdateProgressPayload>
