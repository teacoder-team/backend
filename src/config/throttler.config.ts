import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import { ConfigService } from '@nestjs/config'
import { seconds, type ThrottlerModuleOptions } from '@nestjs/throttler'

import { isDev } from '@/common/utils'

import { getRedisConfig } from './redis.config'

export function getThrottlerConfig(
	configService: ConfigService
): ThrottlerModuleOptions {
	return {
		throttlers: [
			{
				name: 'strict',
				ttl: seconds(1),
				limit: 3
			},
			{
				name: 'moderate',
				ttl: seconds(10),
				limit: 20
			},
			{
				name: 'relaxed',
				ttl: seconds(60),
				limit: 100
			}
		],
		errorMessage:
			'Too many requests. Please pause and try again a little later.',
		storage: new ThrottlerStorageRedisService(
			getRedisConfig(configService)
		),
		skipIf: context => !isDev(configService)
	}
}
