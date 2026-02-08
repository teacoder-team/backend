import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis'
import { ConfigService } from '@nestjs/config'
import { seconds, type ThrottlerModuleOptions } from '@nestjs/throttler'

import { isDev } from '@/shared/utils'

import type { AllConfigs } from '../definitions'

import { getRedisConfig } from './redis.config-loader'

export function getThrottlerConfig(
	configService: ConfigService<AllConfigs>
): ThrottlerModuleOptions {
	return {
		throttlers: [
			{
				name: 'strict',
				ttl: seconds(30),
				limit: 50
			},
			{
				name: 'moderate',
				ttl: seconds(120),
				limit: 200
			},
			{
				name: 'relaxed',
				ttl: seconds(600),
				limit: 2000
			},
			{
				name: 'burst',
				ttl: seconds(5),
				limit: 100
			},
			{
				name: 'hourly',
				ttl: seconds(3600),
				limit: 10000
			}
		],
		errorMessage:
			'Too many requests. Please pause and try again a little later.',
		storage: new ThrottlerStorageRedisService(
			getRedisConfig(configService)
		),
		skipIf: context => isDev(configService)
	}
}
