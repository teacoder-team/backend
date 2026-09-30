import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { requestContext } from '~/plugins/request-context'

import {
	CourseLessonListResponse,
	CourseListResponse,
	CourseResponse,
	CourseSlugParams
} from './model'
import { getCourseBySlug, getCourseLessons, listCourses } from './service'

export const course = new Elysia({ prefix: '/courses', tags: [TAG.courses] })
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
			summary: 'Каталог курсов',
			description:
				'Все опубликованные курсы, сначала новые. Только данные для карточки в каталоге.'
		}
	})
	.get('/:slug', async ({ params, ip }) => await getCourseBySlug(params.slug, ip), {
		params: 'CourseSlugParams',
		response: 'CourseResponse',
		detail: {
			summary: 'Страница курса',
			description:
				'Полная информация об опубликованном курсе. Увеличивает счётчик просмотров - не чаще раза в 30 минут для одного IP.'
		}
	})
	.get('/:slug/lessons', async ({ params }) => await getCourseLessons(params.slug), {
		params: 'CourseSlugParams',
		response: 'CourseLessonListResponse',
		detail: {
			summary: 'Программа курса',
			description:
				'Опубликованные уроки курса по порядку. Премиум-уроки помечены в `access`; само видео отдаёт `GET /lessons/{id}` и только тем, у кого есть доступ.'
		}
	})
