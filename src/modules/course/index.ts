import { Elysia } from 'elysia'

import { CourseListResponse, CourseResponse, CourseSlugParams } from './model'
import { getCourseBySlug, listCourses } from './service'

export const course = new Elysia({ prefix: '/courses', tags: ['Courses'] })
	.model({ CourseListResponse, CourseResponse, CourseSlugParams })
	.get('/', async () => await listCourses(), {
		response: 'CourseListResponse',
		detail: {
			summary: 'List courses',
			description:
				'Every published course, newest first - just enough to render a catalog card.'
		}
	})
	.get('/:slug', async ({ params }) => await getCourseBySlug(params.slug), {
		params: 'CourseSlugParams',
		response: 'CourseResponse',
		detail: {
			summary: 'Get course by slug',
			description: 'Full details for a single published course. Bumps its view counter.'
		}
	})
