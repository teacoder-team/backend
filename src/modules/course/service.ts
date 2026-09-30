import type { Prisma } from '@prisma/generated/client'

import { NotFoundError } from '~/lib/errors'
import { logger } from '~/lib/logger'
import { redis } from '~/lib/redis'

import {
	findPublishedCourseBySlug,
	findPublishedLessonsForCourse,
	incrementCourseViews,
	listPublishedCourses
} from './repository'

const VIEW_DEDUP_TTL = 30 * 60

/** Paid courses carry their price; free ones (no price, or 0) report `null`. */
const toPrice = (price: Prisma.Decimal | null) => (price?.gt(0) ? price.toNumber() : null)

const viewDedupKey = (courseId: string, ip: string) => `course:view:${courseId}:${ip}`

const registerView = async (courseId: string, ip: string) => {
	const isFirstSeen = await redis.set(viewDedupKey(courseId, ip), '1', 'EX', VIEW_DEDUP_TTL, 'NX')

	if (!isFirstSeen) {
		return
	}

	await incrementCourseViews(courseId)
}

export const listCourses = async () => {
	const courses = await listPublishedCourses()

	return courses.map(({ _count, price, ...course }) => ({
		...course,
		price: toPrice(price),
		lessons: _count.lessons
	}))
}

export const getCourseBySlug = async (slug: string, ip: string) => {
	const course = await findPublishedCourseBySlug(slug)

	if (!course) {
		throw new NotFoundError('Course not found')
	}

	void registerView(course.id, ip).catch((err) => {
		logger.warn({ err, courseId: course.id }, 'course_view_increment_failed')
	})

	return { ...course, price: toPrice(course.price) }
}

export const getCourseLessons = async (slug: string) => {
	const course = await findPublishedCourseBySlug(slug)

	if (!course) {
		throw new NotFoundError('Course not found')
	}

	return findPublishedLessonsForCourse(course.id)
}
