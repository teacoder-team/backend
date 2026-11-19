import { LessonAccess } from '@prisma/generated/client'

import { ForbiddenError, NotFoundError } from '~/lib/errors'
import { issueDownloadLink, lockedReason, resolveLessonAccess } from '~/modules/course/service'

import type { LessonResource } from './model'
import { findPublishedLessonById } from './repository'

const toResources = (value: unknown): LessonResource[] => {
	if (!Array.isArray(value)) {
		return []
	}

	return value.flatMap((entry) => {
		const { title, url } = (entry ?? {}) as Record<string, unknown>

		if (typeof title !== 'string' || typeof url !== 'string' || !URL.canParse(url)) {
			return []
		}

		const { protocol } = new URL(url)

		return protocol === 'https:' || protocol === 'http:' ? [{ title: title.trim(), url }] : []
	})
}

export const getLessonById = async (id: string, userId: string) => {
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

	const { homeworkTask, homeworkChecklist, attachment, ...rest } = lesson
	const task = homeworkTask?.trim()

	return {
		...rest,
		resources: toResources(lesson.resources),
		homework: task ? { task, checklist: homeworkChecklist } : null,
		hasMaterials: Boolean(attachment),
		course
	}
}

export const createLessonMaterialsLink = async (id: string, userId: string) => {
	const lesson = await findPublishedLessonById(id)

	if (!lesson) {
		throw new NotFoundError('Lesson not found')
	}

	if (!lesson.attachment) {
		throw new NotFoundError('This lesson has no materials')
	}

	const gated = { id: lesson.course.id, accessMode: lesson.course.accessMode }

	if (!(await resolveLessonAccess(userId, gated, lesson.access)).hasAccess) {
		throw new ForbiddenError(lockedReason(gated))
	}

	return issueDownloadLink({ userId, courseId: lesson.course.id, lessonId: lesson.id })
}
