import { ConfigService } from '@nestjs/config'
import type { QueueOptions } from 'bullmq'

export function getBullmqConfig(configService: ConfigService): QueueOptions {
	return {
		connection: {
			username: configService.getOrThrow<string>('REDIS_USER'),
			host: configService.getOrThrow<string>('REDIS_HOST'),
			port: configService.getOrThrow<number>('REDIS_PORT'),
			password: configService.getOrThrow<string>('REDIS_PASSWORD'),
			maxRetriesPerRequest: 5,
			retryStrategy: times => Math.min(times * 50, 2000)
		},
		prefix: configService.getOrThrow<string>('QUEUE_PREFIX')
	}
}
