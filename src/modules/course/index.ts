import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { authGuard, optionalAuth } from '~/plugins/auth-guard'
import { requestContext } from '~/plugins/request-context'

import {
	CourseLessonListResponse,
	CourseLibraryResponse,
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
	getCourseLibrary,
	listCourses,
	openMaterialsDownload
} from './service'

export const course = new Elysia({ prefix: '/courses', tags: [TAG.courses] })
	.use(requestContext)
	.use(optionalAuth)
	.use(authGuard)
	.model({
		CourseLessonListResponse,
		CourseLibraryResponse,
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
	.get('/library', async ({ session }) => await getCourseLibrary(session.userId), {
		auth: true,
		response: 'CourseLibraryResponse',
		detail: {
			summary: 'Библиотека курсов',
			description:
				'Курсы, доступные текущему пользователю: опубликованные Premium-курсы при активной подписке и купленные курсы независимо от наличия подписки. Покупка сохраняет доступ, даже если режим курса изменён с PURCHASE на PREMIUM. Курсы с текущим режимом FREE исключены, в том числе ранее купленные. Каждый курс возвращается один раз, сначала новые. Без доступных курсов возвращается пустой массив.',
			security: [{ bearerAuth: [] }]
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
				security: [{ bearerAuth: [] }, {}],
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
				security: [{ bearerAuth: [] }, {}],
				description:
					'Программа курса доступна без авторизации. Без секций возвращается плоский список опубликованных уроков: `id`, `title`, `slug` и `isCompleted` для авторизованного пользователя. При наличии секций верхний массив содержит секции `{ id, title, lessons }` и уроки без секции `{ id, title, slug }` с тем же `isCompleted`. Они отсортированы вместе по `position`; уроки внутри каждой секции - по собственному `position`. При одинаковой позиции порядок определяется по ID. Пустые секции возвращаются с пустым массивом `lessons`. Значения `position` в ответ не включаются. `isCompleted` - пройден ли урок текущим пользователем; возвращается только при авторизации, без неё поля нет. Содержимое урока и проверка доступа - `GET /lessons/{id}`.'
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
