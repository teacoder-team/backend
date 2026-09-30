import { warmDisposableEmails } from '~/lib/datasets/disposable-emails'
import { warmGeoDatabase } from '~/lib/datasets/geo'
import { connectDatabase, disconnectDatabase } from '~/lib/db'
import { logger } from '~/lib/logger'
import { closeMailTransport, verifyMailTransport } from '~/lib/mail/transport'
import { QUEUE, queues } from '~/lib/queue/queues'
import { startWorker } from '~/lib/queue/runner'
import { connectRedis, disconnectRedis } from '~/lib/redis'
import { emailJobs } from '~/modules/auth/jobs'
import { courseEmailJobs } from '~/modules/course/jobs'
import { maintenanceJobs, scheduleMaintenance } from '~/modules/session/jobs'
import type { Worker } from 'bullmq'

let workers: Worker[] = []

export const bootstrap = async () => {
	const startedAt = performance.now()

	try {
		await Promise.all([
			connectDatabase(),
			connectRedis(),
			warmGeoDatabase(),
			warmDisposableEmails()
		])

		workers = [
			startWorker(QUEUE.EMAIL, { ...emailJobs, ...courseEmailJobs }),
			startWorker(QUEUE.MAINTENANCE, maintenanceJobs)
		]

		await scheduleMaintenance()

		verifyMailTransport().catch((err) => {
			logger.error({ context: 'mail', err }, 'smtp_verification_failed')
		})

		logger.info(
			{
				context: 'bootstrap',
				duration: `${(performance.now() - startedAt).toFixed(0)}ms`
			},
			'application_ready'
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
		...queues.map((queue) => queue.close())
	])

	closeMailTransport()

	await Promise.allSettled([disconnectDatabase(), disconnectRedis()])

	logger.info({ context: 'shutdown' }, 'shutdown_complete')
}
