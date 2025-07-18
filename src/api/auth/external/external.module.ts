import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { OAuthModule } from '@/api/oauth/oauth.module'
import { getOAuthConfig } from '@/config'

import { ExternalController } from './external.controller'
import { ExternalService } from './external.service'

@Module({
	imports: [
		OAuthModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getOAuthConfig,
			inject: [ConfigService]
		})
	],
	controllers: [ExternalController],
	providers: [ExternalService]
})
export class ExternalModule {}
