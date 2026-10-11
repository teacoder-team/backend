import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { authGuard } from '~/plugins/auth-guard'

import { LessonParams, LessonResponse } from './model'
import { getLessonById } from './service'

export const lesson = new Elysia({ prefix: '/lessons', tags: [TAG.lessons] })
	.use(authGuard)
	.model({ LessonParams, LessonResponse })
	.get('/:id', async ({ params, session }) => await getLessonById(params.id, session.userId), {
		auth: true,
		params: 'LessonParams',
		response: 'LessonResponse',
		detail: {
			summary: 'Урок',
			security: [{ bearerAuth: [] }],
			description:
				'Содержимое урока вместе с видео и курс, к которому он относится. Авторизация обязательна для любого урока, включая бесплатные и ознакомительные: передайте access-токен в `Authorization: Bearer <token>`. Без токена, с просроченным токеном или отозванной сессией - 401. Бесплатные уроки доступны любому авторизованному пользователю; для закрытых проверяется доступ по подписке или покупке курса, иначе - 403.'
		}
	})
