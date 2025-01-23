import type { ConfigService } from '@nestjs/config'
import type { TypeOrmModuleOptions } from '@nestjs/typeorm'

import { isDev } from '@/common/utils'

export function getTypeOrmConfig(
	configService: ConfigService
): TypeOrmModuleOptions {
	return {
		type: 'postgres',
		host: configService.getOrThrow<string>('POSTGRES_HOST'),
		port: configService.getOrThrow<number>('POSTGRES_PORT'),
		username: configService.getOrThrow<string>('POSTGRES_USER'),
		password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
		database: configService.getOrThrow<string>('POSTGRES_DATABASE'),
		autoLoadEntities: true,
		synchronize: isDev(configService)
	}
}
