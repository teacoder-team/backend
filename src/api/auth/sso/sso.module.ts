import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'

import { getOAuthConfig } from '@/config'
import { OAuthModule } from '@/libs/oauth/oauth.module'

import { SsoController } from './sso.controller'
import { SsoService } from './sso.service'

@Module({
	imports: [
		OAuthModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getOAuthConfig,
			inject: [ConfigService]
		})
	],
	controllers: [SsoController],
	providers: [SsoService]
})
export class SsoModule {}
