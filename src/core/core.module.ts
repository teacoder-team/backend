import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { TurnstileModule } from 'nest-cloudflare-turnstile'

import { AccountModule } from '@/modules/auth/account/account.module'
import { RecoveryModule } from '@/modules/auth/recovery/recovery.module'
import { SessionModule } from '@/modules/auth/session/session.module'
import { TotpModule } from '@/modules/auth/totp/totp.module'
import { CategoryModule } from '@/modules/category/category.module'
import { CourseModule } from '@/modules/course/course.module'
import { MailModule } from '@/modules/libs/mail/mail.module'
import { S3Module } from '@/modules/libs/s3/s3.module'
import { TelegramModule } from '@/modules/libs/telegram/telegram.module'
import { StatisticsModule } from '@/modules/statistics/statistics.module'
import { IS_DEV_ENV } from '@/shared/utils/is-dev.util'

import { getPassportConfig } from './config/passport.config'
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
		PassportModule.registerAsync({
			useFactory: getPassportConfig
		}),
		TurnstileModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getTurnstileConfig,
			inject: [ConfigService]
		}),
		PrismaModule,
		RedisModule,
		SwaggerModule,
		S3Module,
		MailModule,
		TelegramModule,
		AccountModule,
		SessionModule,
		TotpModule,
		RecoveryModule,
		CourseModule,
		CategoryModule,
		StatisticsModule
	]
})
export class CoreModule {}
