import { LessonAccess } from '@prisma/generated/client'

import { ForbiddenError, NotFoundError } from '~/lib/errors'
import { lockedReason, resolveCourseAccess } from '~/modules/course/access'

import { findPublishedLessonById } from './repository'

export const getLessonById = async (id: string, userId: string | null) => {
	const lesson = await findPublishedLessonById(id)

	if (!lesson) {
		throw new NotFoundError('Lesson not found')
	}

	const { accessMode, ...course } = lesson.course
	const gated = { id: course.id, accessMode }

	if (
		lesson.access === LessonAccess.PREMIUM &&
		!(await resolveCourseAccess(userId, gated)).hasAccess
	) {
		throw new ForbiddenError(lockedReason(gated))
	}

	return { ...lesson, course }
}
