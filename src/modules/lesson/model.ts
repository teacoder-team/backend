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

const LessonResourceSchema = t.Object(
	{
		title: t.String({
			description: 'Название ссылки - как её показывать в списке.',
			examples: ['Bun runtime']
		}),
		url: t.String({
			description: 'Адрес материала, всегда `http(s)`.',
			examples: ['https://bun.com/docs/runtime']
		})
	},
	{ description: 'Ссылка на дополнительный материал к уроку.' }
)

const LessonHomework = t.Object(
	{
		task: t.String({
			description: 'Описание задания: что нужно сделать после урока.',
			examples: ['Собрать CLI с aliases, JSON/TOML config и отчётом о watch/hot.']
		}),
		checklist: t.Array(
			t.String({
				description: 'Пункт, по которому можно самому проверить работу.',
				examples: ['Невалидный порт отклоняется до побочных эффектов.']
			}),
			{
				description:
					'Чеклист для самопроверки в порядке показа. Пустой массив, если чеклиста нет.'
			}
		)
	},
	{
		description:
			'Домашнее задание после урока. Сдачи и проверки в API нет - задание только для самостоятельной работы.'
	}
)

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
			description: '`FREE` - открыт всем, `PREMIUM` - нужна подписка или покупка курса.',
			examples: [LessonAccess.FREE]
		}),
		kinescopeId: t.Nullable(
			t.String({
				description:
					'Идентификатор видео в Kinescope. Закрытый урок сюда не доходит - запрос к нему отвечает 403.',
				examples: ['UCSOW2TFUGL34ZWCOZSAHDFU4W']
			})
		),
		homework: t.Nullable(LessonHomework),
		resources: t.Array(LessonResourceSchema, {
			description:
				'Материалы к уроку: официальная документация, статьи, первоисточники - в том порядке, в котором их нужно показывать. Пустой массив, если материалов нет.'
		}),
		course: t.Object(
			{
				id: t.String({
					description: 'Идентификатор курса.',
					examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d']
				}),
				title: t.String({
					description: 'Название курса.',
					examples: ['Основы TypeScript']
				}),
				slug: t.String({
					description:
						'Идентификатор курса для URL - программа курса: `GET /courses/:slug/lessons`.',
					examples: ['osnovy-typescript']
				})
			},
			{
				description:
					'Курс урока - чтобы показать программу и заголовок без лишних запросов.'
			}
		)
	},
	{ description: 'Урок.' }
)

export type LessonParamsInput = Static<typeof LessonParams>
export type LessonResource = Static<typeof LessonResourceSchema>
