import type { Html } from '@teacoder/telegram'

import { adminNotifier } from '~/lib/integrations/telegram'
import type { JobHandlers } from '~/lib/queue/runner'
import { getUserEmail } from '~/modules/auth/service'
import { hasActiveSubscription } from '~/modules/subscription/repository'

import { coursePurchaseMessage, registrationMessage } from './messages'
import type { NotificationJobs } from './queue'
import {
	findAccountsOnVisitor,
	findPurchasedCourse,
	findPurchaseDetails,
	findRegistrationDetails
} from './repository'

/** Retry only when no chat got it - retrying a partial success would duplicate the message. */
const deliver = async (message: Html) => {
	const report = await adminNotifier?.send(message)

	if (report?.delivered === 0) {
		throw new Error('Admin notification reached no chat')
	}
}

export const notificationJobs: JobHandlers<NotificationJobs> = {
	notifyCoursePurchase: async ({ paymentId }) => {
		const purchase = await findPurchaseDetails(paymentId)

		if (!purchase) {
			return
		}

		const [email, hasPremium, course] = await Promise.all([
			getUserEmail(purchase.user.id),
			hasActiveSubscription(purchase.user.id),
			purchase.courseId ? findPurchasedCourse(purchase.courseId) : null
		])

		await deliver(coursePurchaseMessage({ purchase, course, email, hasPremium }))
	},

	notifyRegistration: async ({ userId, via }) => {
		const [user, email] = await Promise.all([
			findRegistrationDetails(userId),
			getUserEmail(userId)
		])

		if (!user) {
			return
		}

		const visitorId = user.sessions[0]?.visitorId
		const sameDevice = visitorId ? await findAccountsOnVisitor(visitorId, userId) : []

		await deliver(registrationMessage({ user, email, via, sameDevice }))
	}
}
