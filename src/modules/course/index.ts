import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { authGuard, optionalAuth } from '~/plugins/auth-guard'
import { requestContext } from '~/plugins/request-context'

import {
	CourseLessonListResponse,
	CourseListResponse,
	CourseResponse,
	CourseSlugParams,
	DownloadParams,
	MaterialsLinkResponse
} from './model'
import {
	createMaterialsLink,
	getCourseBySlug,
	getCourseLessons,
	listCourses,
	openMaterialsDownload
} from './service'

export const course = new Elysia({ prefix: '/courses', tags: [TAG.courses] })
	.use(requestContext)
	.use(optionalAuth)
	.use(authGuard)
	.model({
		CourseLessonListResponse,
		CourseListResponse,
		CourseResponse,
		CourseSlugParams,
		MaterialsLinkResponse
	})
	.get('/', async () => await listCourses(), {
		response: 'CourseListResponse',
		detail: {
			summary: 'Каталог курсов',
			description:
				'Все опубликованные курсы, сначала новые. Только данные для карточки в каталоге: цена, режим доступа (`accessMode`) и есть ли материалы.'
		}
	})
	.get(
		'/:slug',
		async ({ params, ip, optionalSession }) =>
			await getCourseBySlug(params.slug, ip, optionalSession?.userId ?? null),
		{
			params: 'CourseSlugParams',
			response: 'CourseResponse',
			detail: {
				summary: 'Страница курса',
				description:
					'Полная информация об опубликованном курсе и `access` - открыт ли он текущему пользователю и почему (авторизация необязательна). Увеличивает счётчик просмотров - не чаще раза в 30 минут для одного IP.'
			}
		}
	)
	.get(
		'/:slug/lessons',
		async ({ params, optionalSession }) =>
			await getCourseLessons(params.slug, optionalSession?.userId ?? null),
		{
			params: 'CourseSlugParams',
			response: 'CourseLessonListResponse',
			detail: {
				summary: 'Программа курса',
				description:
					'Опубликованные уроки курса по порядку. `isLocked` показывает, откроется ли урок текущему пользователю (авторизация необязательна); само видео отдаёт `GET /lessons/{id}`.'
			}
		}
	)
	.post(
		'/:slug/materials/link',
		async ({ params, session }) => await createMaterialsLink(params.slug, session.userId),
		{
			auth: true,
			params: 'CourseSlugParams',
			response: 'MaterialsLinkResponse',
			detail: {
				summary: 'Ссылка на материалы курса',
				description:
					'Выдаёт временную ссылку на архив с материалами (исходным кодом) курса. Доступ - как к закрытым урокам: бесплатный курс, покупка или (в режиме `PREMIUM`) подписка, иначе 403. Если материалов у курса нет (`hasMaterials: false`) - 404.',
				security: [{ bearerAuth: [] }]
			}
		}
	)

export const downloads = new Elysia({ prefix: '/downloads', tags: [TAG.courses] })
	.use(requestContext)
	.model({ DownloadParams })
	.get(
		'/:token',
		async ({ params, ip, userAgent }) => {
			const file = await openMaterialsDownload(params.token, ip, userAgent)
			const headers: Record<string, string> = {
				'content-type': file.contentType,
				'content-disposition': `attachment; filename="${file.filename}"`,
				'cache-control': 'private, no-store'
			}

			if (file.contentLength) {
				headers['content-length'] = file.contentLength
			}

			return new Response(file.body, { headers })
		},
		{
			params: 'DownloadParams',
			detail: {
				summary: 'Скачивание материалов курса',
				description:
					'Отдаёт архив по ссылке из `POST /courses/{slug}/materials/link` - открывается прямо в браузере, авторизация не нужна: токен в ссылке и есть пропуск. Ссылка действует 5 минут, каждая загрузка записывается в журнал. Истёкшая или неверная ссылка - 404.'
			}
		}
	)
