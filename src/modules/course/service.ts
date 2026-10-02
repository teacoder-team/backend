import { randomBytes } from 'node:crypto'

import { CourseAccessMode, type Prisma } from '@prisma/generated/client'

import { env } from '~/config/env'
import { ForbiddenError, InternalError, NotFoundError } from '~/lib/errors'
import { orion } from '~/lib/integrations/orion'
import { logger } from '~/lib/logger'
import { redis } from '~/lib/redis'

import { isLessonOpen, resolveCourseAccess } from './access'
import {
	findCourseAttachment,
	findPublishedCourseBySlug,
	findPublishedLessonsForCourse,
	incrementCourseViews,
	listPublishedCourses,
	logCourseDownload
} from './repository'

const VIEW_DEDUP_TTL = 30 * 60
const DOWNLOAD_LINK_TTL = 5 * 60
const UPSTREAM_TIMEOUT_MS = 30_000

/** Paid courses carry their price; free ones (no price, or 0) report `null`. */
const toPrice = (price: Prisma.Decimal | null) => (price?.gt(0) ? price.toNumber() : null)

const viewDedupKey = (courseId: string, ip: string) => `course:view:${courseId}:${ip}`
const downloadKey = (token: string) => `course:materials:${token}`

const registerView = async (courseId: string, ip: string) => {
	const isFirstSeen = await redis.set(viewDedupKey(courseId, ip), '1', 'EX', VIEW_DEDUP_TTL, 'NX')

	if (!isFirstSeen) {
		return
	}

	await incrementCourseViews(courseId)
}

const findCourse = async (slug: string) => {
	const course = await findPublishedCourseBySlug(slug)

	if (!course) {
		throw new NotFoundError('Course not found')
	}

	return course
}

export const listCourses = async () => {
	const courses = await listPublishedCourses()

	return courses.map(({ _count, price, attachment, ...course }) => ({
		...course,
		price: toPrice(price),
		hasMaterials: Boolean(attachment),
		lessons: _count.lessons
	}))
}

export const getCourseBySlug = async (slug: string, ip: string, userId: string | null) => {
	const { attachment, price, ...course } = await findCourse(slug)

	void registerView(course.id, ip).catch((err) => {
		logger.warn({ err, courseId: course.id }, 'course_view_increment_failed')
	})

	return {
		...course,
		price: toPrice(price),
		hasMaterials: Boolean(attachment),
		access: await resolveCourseAccess(userId, course)
	}
}

export const getCourseLessons = async (slug: string, userId: string | null) => {
	const course = await findCourse(slug)
	const [lessons, entitlement] = await Promise.all([
		findPublishedLessonsForCourse(course.id),
		resolveCourseAccess(userId, course)
	])

	return lessons.map((lesson) => ({
		...lesson,
		isLocked: !isLessonOpen(lesson.access, entitlement)
	}))
}

/** A short-lived link, so the storage address of the archive is never handed out. */
export const createMaterialsLink = async (slug: string, userId: string) => {
	const course = await findCourse(slug)

	if (!course.attachment) {
		throw new NotFoundError('This course has no materials')
	}

	if (!(await resolveCourseAccess(userId, course)).hasAccess) {
		throw new ForbiddenError(
			course.accessMode === CourseAccessMode.PURCHASE
				? 'Course materials require buying the course'
				: 'Course materials require TeaCoder Premium or buying the course'
		)
	}

	const token = randomBytes(32).toString('base64url')

	await redis.set(
		downloadKey(token),
		JSON.stringify({ courseId: course.id, userId }),
		'EX',
		DOWNLOAD_LINK_TTL
	)

	return { url: `${env.GATEWAY_URL}/downloads/${token}`, expiresIn: DOWNLOAD_LINK_TTL }
}

const EXTENSION = /\.[a-z0-9]{1,8}$/i

const archiveName = (slug: string, attachment: string, contentType: string | null) => {
	const extension =
		attachment.split('/').pop()?.match(EXTENSION)?.[0] ??
		(contentType?.includes('zip') ? '.zip' : '')

	return `${slug}${extension}`
}

/**
 * The link stays valid for its whole lifetime rather than one request - browsers and download
 * managers retry and resume. Every request is logged.
 */
export const openMaterialsDownload = async (token: string, ip: string, userAgent: string) => {
	const parked = await redis.get(downloadKey(token))

	if (!parked) {
		throw new NotFoundError('Download link is invalid or expired')
	}

	const { courseId, userId } = JSON.parse(parked) as { courseId: string; userId: string }
	const course = await findCourseAttachment(courseId)

	if (!course?.attachment) {
		throw new NotFoundError('This course has no materials')
	}

	const source = course.attachment.startsWith('http')
		? course.attachment
		: orion.fileUrl('attachments', course.attachment)

	const upstream = await fetch(source, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) }).catch(
		(err: unknown) => {
			logger.error({ context: 'course', courseId, err }, 'course_materials_fetch_failed')

			return null
		}
	)

	if (!upstream?.ok || !upstream.body) {
		logger.error(
			{ context: 'course', courseId, status: upstream?.status },
			'course_materials_unavailable'
		)

		throw new InternalError('Course materials are temporarily unavailable')
	}

	await logCourseDownload({ token, userId, courseId, ip, userAgent }).catch((err: unknown) => {
		logger.warn({ context: 'course', courseId, err }, 'course_download_log_failed')
	})

	const contentType = upstream.headers.get('content-type')

	return {
		body: upstream.body,
		contentType: contentType ?? 'application/octet-stream',
		contentLength: upstream.headers.get('content-length'),
		filename: archiveName(course.slug, course.attachment, contentType)
	}
}
