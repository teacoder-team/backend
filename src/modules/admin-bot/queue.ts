import type { AuthProvider } from '@prisma/generated/client'

import { adminNotifier } from '~/lib/integrations/telegram'
import { logger } from '~/lib/logger'
import { notificationsQueue } from '~/lib/queue/queues'

export type SignUpMethod = AuthProvider | 'EMAIL'

export type NotificationJobs = {
	notifyCoursePurchase: { paymentId: string }
	notifyRegistration: { userId: string; via: SignUpMethod }
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
