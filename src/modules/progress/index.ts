import { Elysia } from 'elysia'

import { authGuard } from '~/plugins/auth-guard'

import {
	CourseIdParams,
	CourseProgressResponse,
	UpdateProgressPayload,
	UpdateProgressResponse
} from './model'
import { getCourseProgress, updateProgress } from './service'

export const progress = new Elysia({ prefix: '/progress', tags: ['Progress'] })
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
				summary: 'Get course progress',
				description: 'How far the current user has gotten through a course.'
			}
		}
	)
	.put('/', async ({ body, session }) => await updateProgress(session.userId, body), {
		body: 'UpdateProgressPayload',
		response: 'UpdateProgressResponse',
		detail: {
			summary: 'Update lesson progress',
			description:
				'Marks a lesson complete or incomplete, adjusts points, and returns the next lesson to continue with.'
		}
	})
