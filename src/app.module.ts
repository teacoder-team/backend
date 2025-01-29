import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { ApiModule } from './api/api.module'
import { IS_DEV_ENV } from './common/utils'
import { InfraModule } from './infra/infra.module'
import { ServicesModule } from './services/services.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			ignoreEnvFile: !IS_DEV_ENV,
			isGlobal: true
		}),
		ApiModule,
		InfraModule,
		ServicesModule
	]
})
export class AppModule {}
