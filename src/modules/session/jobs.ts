import { logger } from '@/infra/logger'
import { maintenanceQueue } from '@/infra/queue/queues'
import type { JobHandlers } from '@/infra/queue/runner'
import { deleteSessionsDeadBefore } from './repository'

/** How long a dead session stays readable as account history. */
const RETENTION_DAYS = 30

const DAY_MS = 24 * 60 * 60 * 1000

const SCHEDULE = '0 3 * * *'

export type MaintenanceJobs = {
	pruneSessions: Record<string, never>
}

export const maintenanceJobs: JobHandlers<MaintenanceJobs> = {
	pruneSessions: async () => {
		const cutoff = new Date(Date.now() - RETENTION_DAYS * DAY_MS)
		const removed = await deleteSessionsDeadBefore(cutoff)

		logger.info(
			{ context: 'maintenance', removed, cutoff },
			'dead_sessions_pruned',
		)
	},
}

export const scheduleMaintenance = () =>
	maintenanceQueue.upsertJobScheduler(
		'prune-sessions',
		{ pattern: SCHEDULE },
		{ name: 'pruneSessions' },
	)
