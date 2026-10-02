import { sendMail } from '~/lib/mail/client'
import NewDeviceLogin from '~/lib/mail/templates/NewDeviceLogin'
import { logger } from '~/lib/logger'
import { emailQueue, maintenanceQueue } from '~/lib/queue/queues'
import type { JobHandlers } from '~/lib/queue/runner'
import { formatDateTime } from '~/lib/utils/date'

import { deleteSessionsDeadBefore, findNewDeviceSession } from './repository'

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

		logger.info({ context: 'maintenance', removed, cutoff }, 'dead_sessions_pruned')
	}
}

export const scheduleMaintenance = () =>
	maintenanceQueue.upsertJobScheduler(
		'prune-sessions',
		{ pattern: SCHEDULE },
		{ name: 'pruneSessions' }
	)

export type SessionEmailJobs = {
	sendNewDeviceLogin: { sessionId: string }
}

const joinPresent = (parts: (string | null)[], separator: string) =>
	parts.filter(Boolean).join(separator) || null

export const sessionEmailJobs: JobHandlers<SessionEmailJobs> = {
	sendNewDeviceLogin: async ({ sessionId }) => {
		const session = await findNewDeviceSession(sessionId)

		if (!session?.user.email) {
			return
		}

		await sendMail({
			to: session.user.email,
			subject: 'Вход в аккаунт TeaCoder с нового устройства',
			template: NewDeviceLogin({
				username: session.user.displayName,
				device: joinPresent([session.browser, session.os], ', '),
				location: joinPresent([session.city, session.country], ', '),
				ip: session.ip,
				time: formatDateTime(session.createdAt)
			})
		})
	}
}

/** Best-effort: a failed alert must not fail the sign-in it is about. */
export const enqueueNewDeviceLogin = async (payload: SessionEmailJobs['sendNewDeviceLogin']) => {
	try {
		await emailQueue.add('sendNewDeviceLogin', payload)
	} catch (err) {
		logger.error({ context: 'session', err, ...payload }, 'new_device_alert_enqueue_failed')
	}
}
