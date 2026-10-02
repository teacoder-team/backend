import { CourseAccessMode, LessonAccess } from '@prisma/generated/client'

import { hasActiveSubscription } from '~/modules/subscription/repository'

import { findCoursePurchase } from './repository'

export type CourseAccessSource = 'FREE' | 'PURCHASE' | 'PREMIUM'

export interface CourseEntitlement {
	hasAccess: boolean
	/** Why the course is open; null when it isn't. */
	via: CourseAccessSource | null
}

export interface GatedCourse {
	id: string
	accessMode: CourseAccessMode
}

/**
 * Who may open a course's premium lessons and materials. A purchase always counts, even after
 * the course moves to another mode - it was bought forever.
 */
export const resolveCourseAccess = async (
	userId: string | null,
	course: GatedCourse
): Promise<CourseEntitlement> => {
	if (course.accessMode === CourseAccessMode.FREE) {
		return { hasAccess: true, via: 'FREE' }
	}

	if (!userId) {
		return { hasAccess: false, via: null }
	}

	if (await findCoursePurchase(userId, course.id)) {
		return { hasAccess: true, via: 'PURCHASE' }
	}

	if (course.accessMode === CourseAccessMode.PREMIUM && (await hasActiveSubscription(userId))) {
		return { hasAccess: true, via: 'PREMIUM' }
	}

	return { hasAccess: false, via: null }
}

/** `FREE` lessons are previews, open to anyone; the rest follow the course. */
export const isLessonOpen = (access: LessonAccess, entitlement: CourseEntitlement) =>
	access === LessonAccess.FREE || entitlement.hasAccess

export const lockedReason = (course: GatedCourse) =>
	course.accessMode === CourseAccessMode.PURCHASE
		? 'This lesson requires buying the course'
		: 'This lesson requires TeaCoder Premium or buying the course'
