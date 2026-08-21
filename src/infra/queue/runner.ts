import { type Job, Worker } from 'bullmq'

import { logger } from '@/infra/logger'
import { queueConnection } from './connection'
import type { QueueName } from './queues'

const CONCURRENCY = 5

export type JobHandlers<Jobs extends Record<string, unknown>> = {
	[Name in keyof Jobs]: (payload: Jobs[Name]) => Promise<void>
}

/**
 * The queue layer stays domain-agnostic: it routes a job to the handler
 * registered under its name and owns nothing else. Handlers live next to the
 * module whose work they do.
 */
export const startWorker = <Jobs extends Record<string, unknown>>(
	queue: QueueName,
	handlers: JobHandlers<Jobs>,
) => {
	const worker = new Worker(
		queue,
		async (job: Job) => {
			const handle = handlers[job.name as keyof Jobs]

			if (!handle) {
				throw new Error(
					`No handler for job "${job.name}" in "${queue}"`,
				)
			}

			await handle(job.data)
		},
		{ connection: queueConnection, concurrency: CONCURRENCY },
	)

	worker.on('completed', (job) => {
		logger.debug(
			{ context: 'queue', queue, job: job.name },
			'job_completed',
		)
	})

	worker.on('failed', (job, err) => {
		logger.error(
			{ context: 'queue', queue, job: job?.name, err },
			'job_failed',
		)
	})

	logger.info({ context: 'queue', queue }, 'worker_started')

	return worker
}
