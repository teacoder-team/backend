import { LessonAccess } from '@prisma/generated/client'

import { canViewCourse } from '~/modules/course/access'
import { ForbiddenError, NotFoundError } from '~/shared/errors'

import { findPublishedLessonById } from './repository'

export const getLessonById = async (id: string, userId: string | null) => {
	const lesson = await findPublishedLessonById(id)

	if (!lesson) throw new NotFoundError('Lesson not found')

	if (lesson.access === LessonAccess.PREMIUM) {
		const hasAccess = userId ? await canViewCourse(userId, lesson.courseId) : false

		if (!hasAccess) {
			throw new ForbiddenError(
				'This lesson requires TeaCoder Premium or the course to be purchased'
			)
		}
	}

	return lesson
}
