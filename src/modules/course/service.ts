import { logger } from '~/infra/logger'

import { createCoursePurchase, findCoursePurchase, type NewCoursePurchase } from './repository'

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
