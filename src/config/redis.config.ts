import { ConfigService } from '@nestjs/config'
import { RedisOptions } from 'ioredis'

export function getRedisConfig(configService: ConfigService): RedisOptions {
	return {
		username: configService.getOrThrow<string>('REDIS_USER'),
		password: configService.getOrThrow<string>('REDIS_PASSWORD'),
		host: configService.getOrThrow<string>('REDIS_HOST'),
		port: configService.getOrThrow<number>('REDIS_PORT')
	}
}
