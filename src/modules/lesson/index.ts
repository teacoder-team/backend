import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { authGuard } from '~/plugins/auth-guard'

import { LessonMaterialsLinkResponse, LessonParams, LessonResponse } from './model'
import { createLessonMaterialsLink, getLessonById } from './service'

export const lesson = new Elysia({ prefix: '/lessons', tags: [TAG.lessons] })
	.use(authGuard)
	.model({ LessonMaterialsLinkResponse, LessonParams, LessonResponse })
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
	.post(
		'/:id/materials/link',
		async ({ params, session }) => await createLessonMaterialsLink(params.id, session.userId),
		{
			auth: true,
			params: 'LessonParams',
			response: 'LessonMaterialsLinkResponse',
			detail: {
				summary: 'Материалы урока',
				security: [{ bearerAuth: [] }],
				description:
					'Выдаёт временную ссылку на архив с материалами конкретного урока - исходниками, файлами примеров, презентацией. Доступ проверяется так же, как к самому уроку: ознакомительный урок открыт любому авторизованному пользователю, закрытый - по подписке или покупке курса, иначе 403.\n\nЕсли у урока нет материалов (`hasMaterials: false`) или урок не опубликован - 404. Ссылка действует 5 минут, каждая загрузка записывается в журнал. Это отдельный архив к уроку; материалы всего курса - `POST /courses/{slug}/materials/link`.'
			}
		}
	)
