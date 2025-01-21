import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TurnstileModule } from 'nestjs-cloudflare-captcha'

import { AccountModule } from '@/modules/auth/account/account.module'
import { SessionModule } from '@/modules/auth/session/session.module'
import { TotpModule } from '@/modules/auth/totp/totp.module'
import { CourseModule } from '@/modules/course/course.module'
import { MailModule } from '@/modules/libs/mail/mail.module'
import { StorageModule } from '@/modules/libs/storage/storage.module'
import { TelegramModule } from '@/modules/libs/telegram/telegram.module'
import { StatisticsModule } from '@/modules/statistics/statistics.module'
import { UsersModule } from '@/modules/users/users.module'
import { IS_DEV_ENV } from '@/shared/utils/is-dev.util'

import { getTurnstileConfig } from './config/turnstile.config'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { SwaggerModule } from './swagger/swagger.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		TurnstileModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getTurnstileConfig,
			inject: [ConfigService]
		}),
		PrismaModule,
		RedisModule,
		SwaggerModule,
		StorageModule,
		MailModule,
		TelegramModule,
		AccountModule,
		SessionModule,
		TotpModule,
		UsersModule,
		CourseModule,
		StatisticsModule
	]
})
export class CoreModule {}
