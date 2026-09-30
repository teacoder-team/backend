import { type Static, t } from 'elysia'

import { LessonAccess } from '@prisma/generated/client'

import { PrismaEnum } from '~/lib/utils/schema'

const LessonId = t.String({
	description: 'Идентификатор урока.',
	examples: ['550e8400-e29b-41d4-a716-446655440000']
})

export const LessonParams = t.Object({
	id: LessonId
})

export const LessonResponse = t.Object(
	{
		id: LessonId,
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
				'`FREE` - открыт всем, `PREMIUM` - нужна подписка или покупка курса.',
			examples: [LessonAccess.FREE]
		}),
		kinescopeId: t.Nullable(
			t.String({
				description:
					'Идентификатор видео в Kinescope. Закрытый урок сюда не доходит - запрос к нему отвечает 403.',
				examples: ['UCSOW2TFUGL34ZWCOZSAHDFU4W']
			})
		),
		courseId: t.String({
			description: 'Курс, к которому относится урок.',
			examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d']
		})
	},
	{ description: 'Урок.' }
)

export type LessonParamsInput = Static<typeof LessonParams>
