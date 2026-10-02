import type { AuthProvider } from '@prisma/generated/client'

import { adminNotifier } from '~/lib/integrations/telegram'
import { logger } from '~/lib/logger'
import { notificationsQueue } from '~/lib/queue/queues'

export type SignUpMethod = AuthProvider | 'EMAIL'

export type NotificationJobs = {
	notifyCoursePurchase: { paymentId: string }
	notifySubscriptionRenewal: {
		paymentId: string
		outcome: 'charged' | 'declined'
	}
	notifySubscriptionPurchase: {
		paymentId: string
		months: number
		/** ISO date; the end before this payment is gone once the transaction commits. */
		previousExpiresAt: string | null
	}
	notifyRegistration: { userId: string; via: SignUpMethod }
	/** Resend id of the received email - the content is fetched in the job, never queued. */
	notifySupportEmail: { emailId: string }
}

const enqueue = async <Name extends keyof NotificationJobs>(
	name: Name,
	payload: NotificationJobs[Name]
) => {
	if (!adminNotifier) {
		return
	}

	await notificationsQueue.add(name, payload).catch((err: unknown) => {
		logger.warn({ context: 'admin_bot', job: name, err }, 'admin_notification_enqueue_failed')
	})
}

export const enqueueCoursePurchaseNotification = (
	payload: NotificationJobs['notifyCoursePurchase']
) => enqueue('notifyCoursePurchase', payload)

export const enqueueRegistrationNotification = (payload: NotificationJobs['notifyRegistration']) =>
	enqueue('notifyRegistration', payload)

export const enqueueSubscriptionPurchaseNotification = (
	payload: NotificationJobs['notifySubscriptionPurchase']
) => enqueue('notifySubscriptionPurchase', payload)

export const enqueueSubscriptionRenewalNotification = (
	payload: NotificationJobs['notifySubscriptionRenewal']
) => enqueue('notifySubscriptionRenewal', payload)

export const enqueueSupportEmailNotification = (payload: NotificationJobs['notifySupportEmail']) =>
	enqueue('notifySupportEmail', payload)
