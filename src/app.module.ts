import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ApiModule } from './api/api.module'
import { IS_DEV_ENV } from './common/utils'
import { InfraModule } from './infra/infra.module'
import { LibsModule } from './libs/libs.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		ApiModule,
		InfraModule,
		LibsModule
	]
})
export class AppModule {}
