import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ApiModule } from './api/api.module'
import { BotModule } from './bot/bot.module'
import { CourseModule } from './domains/course/course.module'
import { InfraModule } from './infra/infra.module'
import { LibsModule } from './libs/libs.module'
import { IS_DEV_ENV } from './shared/utils'

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		ApiModule,
		InfraModule,
		LibsModule,
		BotModule,
		CourseModule
	]
})
export class AppModule {}
