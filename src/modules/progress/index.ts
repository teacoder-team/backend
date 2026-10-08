import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { authGuard } from '~/plugins/auth-guard'

import {
	CourseIdParams,
	CourseProgressResponse,
	UpdateProgressPayload,
	UpdateProgressResponse
} from './model'
import { getCourseProgress, updateProgress } from './service'

export const progress = new Elysia({ prefix: '/progress', tags: [TAG.progress] })
	.use(authGuard)
	.guard({ auth: true, detail: { security: [{ bearerAuth: [] }] } })
	.model({
		CourseIdParams,
		CourseProgressResponse,
		UpdateProgressPayload,
		UpdateProgressResponse
	})
	.get(
		'/:courseId',
		async ({ params, session }) => await getCourseProgress(session.userId, params.courseId),
		{
			params: 'CourseIdParams',
			response: 'CourseProgressResponse',
			detail: {
				summary: 'Прогресс по курсу',
				description:
					'Сколько уроков курса пройдено текущим пользователем и какие именно.'
			}
		}
	)
	.put('/', async ({ body, session }) => await updateProgress(session.userId, body), {
		body: 'UpdateProgressPayload',
		response: 'UpdateProgressResponse',
		detail: {
			summary: 'Отметка урока',
			description:
				'Отмечает урок пройденным или снимает отметку, начисляет или списывает баллы и возвращает следующий урок, с которого стоит продолжить.'
		}
	})
