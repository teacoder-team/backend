import { hasActiveSubscription } from '~/modules/subscription/repository'

import { findCoursePurchase } from './repository'

export const canViewCourse = async (userId: string, courseId: string): Promise<boolean> => {
	if (await findCoursePurchase(userId, courseId)) return true

	return hasActiveSubscription(userId)
}

export const canDownloadCourse = (userId: string, courseId: string): Promise<boolean> =>
	findCoursePurchase(userId, courseId).then(Boolean)
