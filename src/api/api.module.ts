import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { TurnstileModule } from 'nestjs-cloudflare-captcha'

import { getTurnstileConfig } from '@/config/turnstile.config'

import { AccountModule } from './auth/account/account.module'
import { MfaModule } from './auth/mfa/mfa.module'
import { SessionModule } from './auth/session/session.module'
import { CourseModule } from './course/course.module'
import { LessonModule } from './lesson/lesson.module'
import { ProgressModule } from './progress/progress.module'
import { RestrictionModule } from './restriction/restriction.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [
		TurnstileModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getTurnstileConfig,
			inject: [ConfigService]
		}),
		ScheduleModule.forRoot(),
		AccountModule,
		SessionModule,
		MfaModule,
		RestrictionModule,
		UsersModule,
		CourseModule,
		LessonModule,
		ProgressModule
	]
})
export class ApiModule {}
