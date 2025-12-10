import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ApiModule } from './api/api.module'
import { BotModule } from './bots/bot.module'
import {
	appEnv,
	fingerprintEnv,
	heleketEnv,
	hostsEnv,
	kinescopeEnv,
	mailerEnv,
	paytureEnv,
	prodamusEnv,
	queueEnv,
	redisEnv,
	robokassaEnv,
	sentinelEnv,
	storageEnv,
	telegramEnv,
	turnstileEnv,
	webauthnEnv,
	yookassaEnv
} from './config'
import { CourseModule } from './domains/course/course.module'
import { InfraModule } from './infra/infra.module'
import { LibsModule } from './libs/libs.module'
import { IS_DEV_ENV } from './shared/utils'
import { CoreModule } from './core/core.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true,
			load: [
				appEnv,
				fingerprintEnv,
				heleketEnv,
				hostsEnv,
				kinescopeEnv,
				mailerEnv,
				paytureEnv,
				// prodamusEnv,
				queueEnv,
				redisEnv,
				// robokassaEnv,
				sentinelEnv,
				storageEnv,
				telegramEnv,
				turnstileEnv,
				webauthnEnv,
				yookassaEnv
			]
		}),
		ApiModule,
		InfraModule,
		LibsModule,
		BotModule,
		CourseModule,
		CoreModule
	]
})
export class AppModule {}
