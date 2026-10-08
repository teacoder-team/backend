import { env } from '~/config/env'
import type { ConnectionOptions } from 'bullmq'

export const queueConnection: ConnectionOptions = {
	url: env.REDIS_URL,
	maxRetriesPerRequest: null
}
