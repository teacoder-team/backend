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
					'Содержимое урока вместе с видео. Бесплатные уроки открыты всем, даже без входа. Для премиум-уроков нужна активная подписка или покупка курса, иначе ответ 403. Авторизация необязательна, но без неё доступны только бесплатные уроки.'
			}
		}
	)
