import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { TurnstileModule } from 'nestjs-cloudflare-captcha'

import { EnhancedThrottlerGuard } from '@/common/guards'
import { getThrottlerConfig, getTurnstileConfig } from '@/config'

import { AccountModule } from './auth/account/account.module'
import { ExternalModule } from './auth/external/external.module'
import { MfaModule } from './auth/mfa/mfa.module'
import { SessionModule } from './auth/session/session.module'
import { CourseModule } from './course/course.module'
import { LessonModule } from './lesson/lesson.module'
import { ProgressModule } from './progress/progress.module'
import { RestrictionModule } from './restriction/restriction.module'
import { StatisticsModule } from './statistics/statistics.module'
import { UsersModule } from './users/users.module'

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
		ScheduleModule.forRoot(),
		AccountModule,
		ExternalModule,
		SessionModule,
		MfaModule,
		RestrictionModule,
		UsersModule,
		CourseModule,
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
