import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TurnstileModule } from 'nestjs-cloudflare-captcha'

import { getTurnstileConfig } from '@/config/turnstile.config'

import { AccountModule } from './auth/account/account.module'
import { MfaModule } from './auth/mfa/mfa.module'
import { SessionModule } from './auth/session/session.module'
import { CourseModule } from './course/course.module'
import { UsersModule } from './users/users.module'

@Module({
	imports: [
		TurnstileModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getTurnstileConfig,
			inject: [ConfigService]
		}),
		AccountModule,
		SessionModule,
		MfaModule,
		UsersModule,
		CourseModule
	]
})
export class ApiModule {}
