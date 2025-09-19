import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TelegrafModule } from 'nestjs-telegraf'

import { getTelegrafConfig } from '@/config'

import { BotService } from './bot.service'
import { StartCommand } from './commands/start.command'

@Module({
	imports: [
		TelegrafModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getTelegrafConfig,
			inject: [ConfigService]
		})
	],
	providers: [BotService, StartCommand],
	exports: [BotService]
})
export class BotModule {}
