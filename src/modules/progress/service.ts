import { LessonAccess } from '@prisma/generated/client'

import { ForbiddenError, NotFoundError } from '~/lib/errors'
import { lockedReason, resolveCourseAccess } from '~/modules/course/access'

import type { UpdateProgressInput } from './model'
import {
	findCompletedLessonIds,
	findLessonForProgress,
	findNextLessonId,
	findPublishedLessonIds,
	upsertProgressWithPoints
} from './repository'

export const getCourseProgress = async (userId: string, courseId: string) => {
	const lessonIds = await findPublishedLessonIds(courseId)

	if (lessonIds.length === 0) {
		return { totalLessons: 0, completedLessons: 0, percentage: 0, completedLessonIds: [] }
	}

	const completedLessonIds = await findCompletedLessonIds(userId, lessonIds)

	return {
		totalLessons: lessonIds.length,
		completedLessons: completedLessonIds.length,
		percentage: Math.round((completedLessonIds.length / lessonIds.length) * 100),
		completedLessonIds
	}
}

export const updateProgress = async (userId: string, input: UpdateProgressInput) => {
	const lesson = await findLessonForProgress(input.lessonId)

	if (!lesson) {
		throw new NotFoundError('Lesson not found')
	}

	const gated = { id: lesson.courseId, accessMode: lesson.course.accessMode }

	if (
		lesson.access === LessonAccess.PREMIUM &&
		!(await resolveCourseAccess(userId, gated)).hasAccess
	) {
		throw new ForbiddenError(lockedReason(gated))
	}

	const progress = await upsertProgressWithPoints(userId, lesson.id, input.isCompleted)
	const nextLessonId = await findNextLessonId(lesson.courseId, lesson.position)

	return { isCompleted: progress.isCompleted, nextLessonId }
}
