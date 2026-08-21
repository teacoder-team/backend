import type { ConnectionOptions } from 'bullmq'

import { env } from '@/config/env'

export const queueConnection: ConnectionOptions = {
	url: env.REDIS_URL,
	maxRetriesPerRequest: null,
}
