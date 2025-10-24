import { ConfigService } from '@nestjs/config'
import type { QueueOptions } from 'bullmq'

import type { AllConfigs } from '../definitions'

import { getRedisConfig } from './redis.config-loader'

export function getBullmqConfig(
	configService: ConfigService<AllConfigs>
): QueueOptions {
	return {
		connection: {
			maxRetriesPerRequest: 5,
			retryStrategy: times => Math.min(times * 50, 2000),
			...getRedisConfig(configService)
		},
		prefix: configService.get('queue.prefix', { infer: true })
	}
}
