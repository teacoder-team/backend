import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { SentinelModule } from '@teacoder/sentinel'

import { TeamanagerBotModule } from '@/bots/teamanager/teamanager.bot.module'
import { getOAuthConfig } from '@/config'

import { SsoController } from './sso.controller'
import { SsoService } from './sso.service'

@Module({
	imports: [
		SentinelModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getOAuthConfig,
			inject: [ConfigService]
		}),
		TeamanagerBotModule
	],
	controllers: [SsoController],
	providers: [SsoService]
})
export class SsoModule {}
