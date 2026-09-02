import { type JobsOptions, Queue } from 'bullmq'

import { queueConnection } from './connection'

export const QUEUE = {
	EMAIL: 'email',
	MAINTENANCE: 'maintenance',
} as const

export type QueueName = (typeof QUEUE)[keyof typeof QUEUE]

const defaultJobOptions: JobsOptions = {
	attempts: 3,
	backoff: { type: 'exponential', delay: 2000 },
	removeOnComplete: true,
	removeOnFail: { age: 24 * 3600 },
}

export const emailQueue = new Queue(QUEUE.EMAIL, {
	connection: queueConnection,
	defaultJobOptions,
})

export const maintenanceQueue = new Queue(QUEUE.MAINTENANCE, {
	connection: queueConnection,
	defaultJobOptions,
})

export const queues = [emailQueue, maintenanceQueue]
