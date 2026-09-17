import { logger } from '~/infra/logger'
import { NotFoundError } from '~/shared/errors'

import {
	createCoursePurchase,
	findCoursePurchase,
	findPublishedCourseBySlug,
	incrementCourseViews,
	listPublishedCourses,
	type NewCoursePurchase
} from './repository'

export const listCourses = async () => {
	const courses = await listPublishedCourses()

	return courses.map(({ _count, ...course }) => ({ ...course, lessons: _count.lessons }))
}

export const getCourseBySlug = async (slug: string) => {
	const course = await findPublishedCourseBySlug(slug)

	if (!course) throw new NotFoundError('Course not found')

	void incrementCourseViews(course.id).catch((err) => {
		logger.warn({ err, courseId: course.id }, 'course_view_increment_failed')
	})

	return { ...course, price: course.price ? Number(course.price) : null }
}

export const grantCoursePurchase = async (input: NewCoursePurchase) => {
	const existing = await findCoursePurchase(input.userId, input.courseId)
	if (existing) return existing

	const purchase = await createCoursePurchase(input)

	logger.info(
		{
			userId: input.userId,
			courseId: input.courseId,
			paymentId: input.paymentId
		},
		'course_purchase_granted'
	)

	return purchase
}
