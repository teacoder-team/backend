import { type JobsOptions, Queue } from 'bullmq'

import { queueConnection } from './connection'

export const QUEUE = {
	EMAIL: 'email',
	MAINTENANCE: 'maintenance',
	NOTIFICATIONS: 'notifications',
	BILLING: 'billing'
} as const

export type QueueName = (typeof QUEUE)[keyof typeof QUEUE]

const defaultJobOptions: JobsOptions = {
	attempts: 3,
	backoff: { type: 'exponential', delay: 2000 },
	removeOnComplete: true,
	removeOnFail: { age: 24 * 3600 }
}

export const emailQueue = new Queue(QUEUE.EMAIL, {
	connection: queueConnection,
	defaultJobOptions
})

export const maintenanceQueue = new Queue(QUEUE.MAINTENANCE, {
	connection: queueConnection,
	defaultJobOptions
})

export const notificationsQueue = new Queue(QUEUE.NOTIFICATIONS, {
	connection: queueConnection,
	defaultJobOptions
})

/**
 * Money moves here, so no automatic retries: a charge that failed for a technical reason is
 * picked up again by the next nightly run, after it has checked what actually happened.
 */
export const billingQueue = new Queue(QUEUE.BILLING, {
	connection: queueConnection,
	defaultJobOptions: { attempts: 1, removeOnComplete: true, removeOnFail: { age: 7 * 24 * 3600 } }
})

export const queues = [emailQueue, maintenanceQueue, notificationsQueue, billingQueue]
