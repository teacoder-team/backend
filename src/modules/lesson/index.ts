import { Elysia } from 'elysia'

import { optionalAuth } from '~/plugins/auth-guard'

import { LessonParams, LessonResponse } from './model'
import { getLessonById } from './service'

export const lesson = new Elysia({ prefix: '/lessons', tags: ['Lessons'] })
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
				summary: 'Get lesson by id',
				description:
					'Free lessons are open to everyone. Premium lessons require an active subscription or a course purchase.'
			}
		}
	)
