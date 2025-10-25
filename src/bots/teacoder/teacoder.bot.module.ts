import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TelegrafModule } from 'nestjs-telegraf'

import type { AllConfigs } from '@/config/definitions'

import { StartCommand } from './commands/start.command'
import { TeacoderBotService } from './teacoder.bot.service'

@Module({
	imports: [
		TelegrafModule.forRootAsync({
			imports: [ConfigModule],
			botName: 'teacoder',
			useFactory: (configService: ConfigService<AllConfigs>) => ({
				token: configService.get('telegram.teacoderToken', {
					infer: true
				})
			}),
			inject: [ConfigService]
		})
	],
	providers: [TeacoderBotService, StartCommand],
	exports: [TeacoderBotService]
})
export class TeacoderBotModule {}
