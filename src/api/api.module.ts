import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule } from '@nestjs/throttler'
import { TurnstileModule } from 'nestjs-cloudflare-captcha'

import { getThrottlerConfig, getTurnstileConfig } from '@/config'
import { EnhancedThrottlerGuard } from '@/shared/guards'

import { ArticleModule } from './article/article.module'
import { AccountModule } from './auth/account/account.module'
import { MfaModule } from './auth/mfa/mfa.module'
import { PasskeyModule } from './auth/passkey/passkey.module'
import { SessionModule } from './auth/session/session.module'
import { SsoModule } from './auth/sso/sso.module'
import { CommentModule } from './comment/comment.module'
import { LessonModule } from './lesson/lesson.module'
import { PaymentModule } from './payment/payment.module'
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
		SsoModule,
		SessionModule,
		MfaModule,
		PasskeyModule,
		RestrictionModule,
		UsersModule,
		LessonModule,
		ProgressModule,
		ArticleModule,
		CommentModule,
		StatisticsModule,
		PaymentModule
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: EnhancedThrottlerGuard
		}
	]
})
export class ApiModule {}
