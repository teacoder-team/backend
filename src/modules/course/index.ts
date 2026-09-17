import { Elysia } from 'elysia'

import { requestContext } from '~/plugins/request-context'

import {
	CourseLessonListResponse,
	CourseListResponse,
	CourseResponse,
	CourseSlugParams
} from './model'
import { getCourseBySlug, getCourseLessons, listCourses } from './service'

export const course = new Elysia({ prefix: '/courses', tags: ['Courses'] })
	.use(requestContext)
	.model({
		CourseLessonListResponse,
		CourseListResponse,
		CourseResponse,
		CourseSlugParams
	})
	.get('/', async () => await listCourses(), {
		response: 'CourseListResponse',
		detail: {
			summary: 'List courses',
			description:
				'Every published course, newest first - just enough to render a catalog card.'
		}
	})
	.get('/:slug', async ({ params, ip }) => await getCourseBySlug(params.slug, ip), {
		params: 'CourseSlugParams',
		response: 'CourseResponse',
		detail: {
			summary: 'Get course by slug',
			description:
				'Full details for a single published course. Bumps its view counter, at most once per IP every 30 minutes.'
		}
	})
	.get('/:slug/lessons', async ({ params }) => await getCourseLessons(params.slug), {
		params: 'CourseSlugParams',
		response: 'CourseLessonListResponse',
		detail: {
			summary: 'List course lessons',
			description:
				'Every published lesson in a course, in order. Premium lessons are flagged via `access`, but their video only unlocks through GET /lessons/:id for entitled users.'
		}
	})
