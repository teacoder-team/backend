import { ConfigService } from '@nestjs/config'
import { RedisOptions } from 'ioredis'

import { AllConfigs } from '../definitions'

export function getRedisConfig(
	configService: ConfigService<AllConfigs>
): RedisOptions {
	return {
		username: configService.get('redis.username', { infer: true }),
		password: configService.get('redis.password', { infer: true }),
		host: configService.get('redis.host', { infer: true }),
		port: configService.get('redis.port', { infer: true })
	}
}
