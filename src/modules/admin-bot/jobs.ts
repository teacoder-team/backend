import { adminNotifier } from '~/lib/integrations/telegram'
import { notificationsQueue } from '~/lib/queue/queues'
import type { JobHandlers } from '~/lib/queue/runner'
import { getUserEmail } from '~/modules/auth/service'
import { hasActiveSubscription } from '~/modules/subscription/repository'

import { coursePurchaseMessage } from './messages'
import { findPurchasedCourse, findPurchaseDetails } from './repository'

/** Ids only - details are loaded fresh and the email decrypted when the job runs. */
export type NotificationJobs = {
	notifyCoursePurchase: { paymentId: string }
}

export const notificationJobs: JobHandlers<NotificationJobs> = {
	notifyCoursePurchase: async ({ paymentId }) => {
		if (!adminNotifier) {
			return
		}

		const purchase = await findPurchaseDetails(paymentId)

		if (!purchase) {
			return
		}

		const [email, hasPremium, course] = await Promise.all([
			getUserEmail(purchase.user.id),
			hasActiveSubscription(purchase.user.id),
			purchase.courseId ? findPurchasedCourse(purchase.courseId) : null
		])

		const report = await adminNotifier.send(
			coursePurchaseMessage({ purchase, course, email, hasPremium })
		)

		/** Retry only when no chat got it - retrying a partial success would duplicate the message. */
		if (report.delivered === 0) {
			throw new Error('Admin notification reached no chat')
		}
	}
}

export const enqueueCoursePurchaseNotification = async (
	payload: NotificationJobs['notifyCoursePurchase']
) => {
	if (!adminNotifier) {
		return
	}

	await notificationsQueue.add('notifyCoursePurchase', payload)
}
