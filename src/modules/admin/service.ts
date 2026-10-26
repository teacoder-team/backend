import type { Job, JobType, Queue } from 'bullmq'

import { NotFoundError } from '~/lib/errors'
import { queues } from '~/lib/queue/queues'

import type { JobListInput, JobQueueName, JobStatusFilter } from './model'

const COUNTED_STATUSES: JobType[] = [
	'waiting',
	'active',
	'delayed',
	'completed',
	'failed',
	'paused'
]

const LISTED_STATUSES: JobType[] = ['waiting', 'active', 'delayed', 'failed', 'completed']

const SENSITIVE_KEY = /token|secret|password|email|url|code/i

const HIDDEN = '[hidden]'

const redact = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(redact)
	}

	if (!value || typeof value !== 'object') {
		return value
	}

	return Object.fromEntries(
		Object.entries(value).map(([key, entry]) => [
			key,
			SENSITIVE_KEY.test(key) ? HIDDEN : redact(entry)
		])
	)
}

const queueByName = new Map(queues.map((queue) => [queue.name as JobQueueName, queue]))

const requireQueue = (name: JobQueueName) => {
	const queue = queueByName.get(name)

	if (!queue) {
		throw new NotFoundError('Queue not found')
	}

	return queue
}

const toJobView = async (queue: Queue, job: Job) => ({
	id: String(job.id),
	name: job.name,
	queue: queue.name as JobQueueName,
	status: await job.getState(),
	attempts: job.attemptsMade,
	payload: redact(job.data),
	failedReason: job.failedReason ?? null,
	createdAt: new Date(job.timestamp).toISOString(),
	processedAt: job.processedOn ? new Date(job.processedOn).toISOString() : null,
	finishedAt: job.finishedOn ? new Date(job.finishedOn).toISOString() : null
})

export const listQueues = async () =>
	await Promise.all(
		queues.map(async (queue) => {
			const [counts, isPaused] = await Promise.all([
				queue.getJobCounts(...COUNTED_STATUSES),
				queue.isPaused()
			])

			return {
				name: queue.name as JobQueueName,
				isPaused,
				counts: {
					waiting: counts.waiting ?? 0,
					active: counts.active ?? 0,
					delayed: counts.delayed ?? 0,
					completed: counts.completed ?? 0,
					failed: counts.failed ?? 0,
					paused: counts.paused ?? 0
				}
			}
		})
	)

const statusesFor = (status: JobStatusFilter | undefined): JobType[] =>
	status ? [status] : LISTED_STATUSES

export const listJobs = async ({ queue, status, limit = 20, offset = 0 }: JobListInput) => {
	const selected = queue ? [requireQueue(queue)] : queues
	const statuses = statusesFor(status)
	const upTo = offset + limit - 1

	const batches = await Promise.all(
		selected.map(async (entry) => {
			const jobs = await entry.getJobs(statuses, 0, upTo, false)

			return Promise.all(jobs.map((job) => toJobView(entry, job)))
		})
	)

	return batches
		.flat()
		.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
		.slice(offset, offset + limit)
}

export const getJob = async (queueName: JobQueueName, jobId: string) => {
	const queue = requireQueue(queueName)
	const job = await queue.getJob(jobId)

	if (!job) {
		throw new NotFoundError('Job not found')
	}

	return toJobView(queue, job)
}
