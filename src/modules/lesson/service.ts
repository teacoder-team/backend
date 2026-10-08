import { LessonAccess } from '@prisma/generated/client'

import { ForbiddenError, NotFoundError } from '~/lib/errors'
import { resolveLessonAccess } from '~/modules/course/access'

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
		!(await resolveLessonAccess(userId, gated, lesson.access)).hasAccess
	) {
		throw new ForbiddenError('This lesson requires TeaCoder Premium or buying the course')
	}

	return { ...lesson, course }
}
