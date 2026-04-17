import { registerAs } from '@nestjs/config'

import { validateEnv } from '@/shared/utils/env'

import type { QueueConfig } from '../definitions'
import { QueueValidator } from '../validators'

export const queueEnv = registerAs<QueueConfig>('queue', () => {
	validateEnv(process.env, QueueValidator)

	return {
		prefix: process.env.QUEUE_PREFIX
	}
})
