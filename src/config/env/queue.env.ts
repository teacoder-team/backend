import { registerAs } from '@nestjs/config'

import type { QueueConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { QueueValidator } from '../validators'

export const queueEnv = registerAs<QueueConfig>('queue', () => {
	validateEnv(process.env, QueueValidator)

	return {
		prefix: process.env.QUEUE_PREFIX
	}
})
