import type { Worker } from 'bullmq'

import { connectDatabase, disconnectDatabase } from '@/infra/db'
import { warmDisposableEmails } from '@/infra/datasets/disposable-emails'
import { warmGeoDatabase } from '@/infra/datasets/geo'
import { logger } from '@/infra/logger'
import { closeMailTransport, verifyMailTransport } from '@/infra/mail/transport'
import { QUEUE, queues } from '@/infra/queue/queues'
import { startWorker } from '@/infra/queue/runner'
import { connectRedis, disconnectRedis } from '@/infra/redis'
import { emailJobs } from '@/modules/auth/jobs'
import { maintenanceJobs, scheduleMaintenance } from '@/modules/session/jobs'

let workers: Worker[] = []

export const bootstrap = async () => {
	const startedAt = performance.now()

	try {
		await Promise.all([
			connectDatabase(),
			connectRedis(),
			warmGeoDatabase(),
			warmDisposableEmails(),
		])

		workers = [
			startWorker(QUEUE.EMAIL, emailJobs),
			startWorker(QUEUE.MAINTENANCE, maintenanceJobs),
		]

		await scheduleMaintenance()

		verifyMailTransport().catch((err) => {
			logger.error({ context: 'mail', err }, 'smtp_verification_failed')
		})

		logger.info(
			{
				context: 'bootstrap',
				duration: `${(performance.now() - startedAt).toFixed(0)}ms`,
			},
			'application_ready',
		)
	} catch (err) {
		logger.fatal({ context: 'bootstrap', err }, 'bootstrap_failed')
		process.exit(1)
	}
}

export const shutdown = async () => {
	logger.info({ context: 'shutdown' }, 'shutting_down')

	await Promise.allSettled([
		...workers.map((worker) => worker.close()),
		...queues.map((queue) => queue.close()),
	])

	closeMailTransport()

	await Promise.allSettled([disconnectDatabase(), disconnectRedis()])

	logger.info({ context: 'shutdown' }, 'shutdown_complete')
}
