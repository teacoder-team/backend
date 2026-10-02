import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { optionalAuth } from '~/plugins/auth-guard'

import { LessonParams, LessonResponse } from './model'
import { getLessonById } from './service'

export const lesson = new Elysia({ prefix: '/lessons', tags: [TAG.lessons] })
	.use(optionalAuth)
	.model({ LessonParams, LessonResponse })
	.get(
		'/:id',
		async ({ params, optionalSession }) =>
			await getLessonById(params.id, optionalSession?.userId ?? null),
		{
			params: 'LessonParams',
			response: 'LessonResponse',
			detail: {
				summary: 'Урок',
				description:
					'Содержимое урока вместе с видео и курс, к которому он относится. Ознакомительные уроки (`access: FREE`) и все уроки бесплатного курса открыты всем, даже без входа. Остальные - по правилам курса (`accessMode`): покупка курса или, в режиме `PREMIUM`, премиум-подписка; иначе 403. Авторизация необязательна.'
			}
		}
	)
