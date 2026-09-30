import { type Static, t } from 'elysia'

export const CourseIdParams = t.Object({
	courseId: t.String({
		description: 'Идентификатор курса.',
		examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d']
	})
})

export const CourseProgressResponse = t.Object(
	{
		totalLessons: t.Number({
			description: 'Опубликованных уроков в курсе.',
			examples: [20]
		}),
		completedLessons: t.Number({ description: 'Из них пройдено.', examples: [5] }),
		percentage: t.Number({
			description: 'Процент прохождения, округлённый до целого.',
			examples: [25]
		}),
		completedLessonIds: t.Array(t.String(), {
			description: 'Идентификаторы пройденных уроков.'
		})
	},
	{ description: 'Прогресс по курсу.' }
)

export const UpdateProgressPayload = t.Object(
	{
		lessonId: t.String({
			description: 'Идентификатор урока.',
			examples: ['550e8400-e29b-41d4-a716-446655440000']
		}),
		isCompleted: t.Boolean({
			description: '`true` - отметить пройденным, `false` - снять отметку.',
			examples: [true]
		})
	},
	{ description: 'Отметка урока.' }
)

export const UpdateProgressResponse = t.Object(
	{
		isCompleted: t.Boolean({ description: 'Пройден ли урок теперь.', examples: [true] }),
		nextLessonId: t.Nullable(
			t.String({
				description: 'Следующий урок курса. `null`, если этот был последним.',
				examples: ['550e8400-e29b-41d4-a716-446655440001']
			})
		)
	},
	{ description: 'Результат отметки урока.' }
)

export type CourseIdParamsInput = Static<typeof CourseIdParams>
export type UpdateProgressInput = Static<typeof UpdateProgressPayload>
