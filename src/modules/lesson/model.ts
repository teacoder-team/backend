import { type Static, t } from 'elysia'

import { LessonAccess } from '@prisma/generated/client'

import { PrismaEnum } from '~/shared/api'

export const LessonParams = t.Object({
	id: t.String({
		description: 'Unique identifier of the lesson.',
		examples: ['550e8400-e29b-41d4-a716-446655440000']
	})
})

export const LessonResponse = t.Object({
	id: t.String({ examples: ['550e8400-e29b-41d4-a716-446655440000'] }),
	title: t.String({ examples: ['Переменные и типы'] }),
	slug: t.String({ examples: ['peremennye-i-tipy'] }),
	description: t.Nullable(t.String({ examples: ['Разбираем базовые типы данных на примерах.'] })),
	position: t.Number({ description: 'Order of the lesson within the course.', examples: [1] }),
	access: PrismaEnum(LessonAccess, {
		description: 'FREE lessons are open to everyone, PREMIUM ones require access.',
		examples: [LessonAccess.FREE]
	}),
	kinescopeId: t.Nullable(
		t.String({
			description:
				'Kinescope video id - fetch fails with 403 before this is ever exposed for a locked lesson.',
			examples: ['UCSOW2TFUGL34ZWCOZSAHDFU4W']
		})
	),
	courseId: t.String({ examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d'] })
})

export type LessonParamsInput = Static<typeof LessonParams>
