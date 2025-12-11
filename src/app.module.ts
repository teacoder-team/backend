import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ApiModule } from './api/api.module'
import { BotModule } from './api/bots/bot.module'
import { PaymentHttpModule } from './api/http/payment/payment.http.module'
import {
	appEnv,
	fingerprintEnv,
	heleketEnv,
	hostsEnv,
	kinescopeEnv,
	mailerEnv,
	prodamusEnv,
	queueEnv,
	redisEnv,
	sentinelEnv,
	storageEnv,
	telegramEnv,
	turnstileEnv,
	webauthnEnv,
	yookassaEnv
} from './config'
import { InfraModule } from './infra/infra.module'
import { LibsModule } from './libs/libs.module'
import { CourseModule } from './modules/course/course.module'
import { WebhookModule } from './modules/payment/infrastructure/webhook/webhook.module'
import { PaymentModule } from './modules/payment/payment.module'
import { SystemModule } from './modules/system/system.module'
import { IS_DEV_ENV } from './shared/utils'

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
				prodamusEnv,
				queueEnv,
				redisEnv,
				sentinelEnv,
				storageEnv,
				telegramEnv,
				turnstileEnv,
				webauthnEnv,
				yookassaEnv
			]
		}),
		SystemModule,
		ApiModule,
		InfraModule,
		LibsModule,
		BotModule,
		CourseModule,
		PaymentModule,
		PaymentHttpModule,
		WebhookModule
	]
})
export class AppModule {}
