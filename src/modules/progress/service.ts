import { LessonAccess } from '@prisma/generated/client'

import { canViewCourse } from '~/modules/course/access'
import { ForbiddenError, NotFoundError } from '~/shared/errors'

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

	if (!lesson) throw new NotFoundError('Lesson not found')

	if (lesson.access === LessonAccess.PREMIUM && !(await canViewCourse(userId, lesson.courseId))) {
		throw new ForbiddenError(
			'This lesson requires TeaCoder Premium or the course to be purchased'
		)
	}

	const progress = await upsertProgressWithPoints(userId, lesson.id, input.isCompleted)
	const nextLessonId = await findNextLessonId(lesson.courseId, lesson.position)

	return { isCompleted: progress.isCompleted, nextLessonId }
}
