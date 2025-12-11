import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'
import { TurnstileModule } from 'nestjs-cloudflare-captcha'

import {
	getFingerprintConfig,
	getThrottlerConfig,
	getTurnstileConfig
} from '@/config'
import { FingerprintModule } from '@/libs/fingerprint/fingerprint.module'
import { EnhancedThrottlerGuard } from '@/shared/guards'

import { AccountModule } from './http/auth/account/account.module'
import { MfaModule } from './http/auth/mfa/mfa.module'
import { PasskeyModule } from './http/auth/passkey/passkey.module'
import { SessionModule } from './http/auth/session/session.module'
import { SsoModule } from './http/auth/sso/sso.module'
import { LessonModule } from './http/lesson/lesson.module'
import { ProgressModule } from './http/progress/progress.module'
import { RestrictionModule } from './http/restriction/restriction.module'
import { StatisticsModule } from './http/statistics/statistics.module'
import { UsersModule } from './http/users/users.module'

@Module({
	imports: [
		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getThrottlerConfig,
			inject: [ConfigService]
		}),
		TurnstileModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getTurnstileConfig,
			inject: [ConfigService]
		}),
		FingerprintModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getFingerprintConfig,
			inject: [ConfigService]
		}),
		ScheduleModule.forRoot(),
		AccountModule,
		SsoModule,
		SessionModule,
		MfaModule,
		PasskeyModule,
		RestrictionModule,
		UsersModule,
		LessonModule,
		ProgressModule,
		StatisticsModule
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: EnhancedThrottlerGuard
		}
	]
})
export class ApiModule {}
