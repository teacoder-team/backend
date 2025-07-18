import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { TurnstileModule } from 'nestjs-cloudflare-captcha'

import { getTurnstileConfig } from '@/config'

import { ArticleModule } from './article/article.module'
import { AccountModule } from './auth/account/account.module'
import { ExternalModule } from './auth/external/external.module'
import { MfaModule } from './auth/mfa/mfa.module'
import { PasskeyModule } from './auth/passkey/passkey.module'
import { SessionModule } from './auth/session/session.module'
import { CommentModule } from './comment/comment.module'
import { CourseModule } from './course/course.module'
import { LessonModule } from './lesson/lesson.module'
import { ProgressModule } from './progress/progress.module'
import { RestrictionModule } from './restriction/restriction.module'
import { StatisticsModule } from './statistics/statistics.module'
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
		ExternalModule,
		SessionModule,
		MfaModule,
		PasskeyModule,
		RestrictionModule,
		UsersModule,
		CourseModule,
		LessonModule,
		ProgressModule,
		ArticleModule,
		CommentModule,
		StatisticsModule
	]
})
export class ApiModule {}
