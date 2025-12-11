import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TelegrafModule } from 'nestjs-telegraf'

import type { AllConfigs } from '@/config/definitions'

import { StartCommand } from './commands/start.command'
import { TeamanagerBotService } from './teamanager.bot.service'

@Module({
	imports: [
		TelegrafModule.forRootAsync({
			imports: [ConfigModule],
			botName: 'teamanager',
			useFactory: (configService: ConfigService<AllConfigs>) => ({
				token: configService.get('telegram.teamanagerToken', {
					infer: true
				})
			}),
			inject: [ConfigService]
		})
	],
	providers: [TeamanagerBotService, StartCommand],
	exports: [TeamanagerBotService]
})
export class TeamanagerBotModule {}
