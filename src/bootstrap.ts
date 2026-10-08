import type { Worker } from 'bullmq'

import { warmDisposableEmails } from '~/lib/datasets/disposable-emails'
import { warmGeoDatabase } from '~/lib/datasets/geo'
import { connectDatabase, disconnectDatabase } from '~/lib/db'
import { logger } from '~/lib/logger'
import { QUEUE, queues } from '~/lib/queue/queues'
import { startWorker } from '~/lib/queue/runner'
import { connectRedis, disconnectRedis } from '~/lib/redis'
import { startAdminBot, stopAdminBot } from '~/modules/admin-bot/bot'
import { notificationJobs } from '~/modules/admin-bot/jobs'
import { emailJobs } from '~/modules/auth/jobs'
import { billingJobs, billingMaintenanceJobs, scheduleNightlyBilling } from '~/modules/billing/jobs'
import { courseEmailJobs } from '~/modules/course/jobs'
import { oauthEmailJobs } from '~/modules/oauth/jobs'
import { maintenanceJobs, scheduleMaintenance, sessionEmailJobs } from '~/modules/session/jobs'
import { subscriptionEmailJobs } from '~/modules/subscription/jobs'

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
			startWorker(QUEUE.EMAIL, {
				...emailJobs,
				...courseEmailJobs,
				...sessionEmailJobs,
				...oauthEmailJobs,
				...subscriptionEmailJobs
			}),
			startWorker(QUEUE.MAINTENANCE, { ...maintenanceJobs, ...billingMaintenanceJobs }),
			startWorker(QUEUE.BILLING, billingJobs),
			startWorker(QUEUE.NOTIFICATIONS, notificationJobs)
		]

		await scheduleMaintenance()
		await scheduleNightlyBilling()

		startAdminBot()

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
		stopAdminBot(),
		...workers.map((worker) => worker.close()),
		...queues.map((queue) => queue.close())
	])

	await Promise.allSettled([disconnectDatabase(), disconnectRedis()])

	logger.info({ context: 'shutdown' }, 'shutdown_complete')
}
