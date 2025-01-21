import { ConfigService } from '@nestjs/config'
import { TelegrafModuleOptions } from 'nestjs-telegraf'

export function getTelegrafConfig(
	configService: ConfigService
): TelegrafModuleOptions {
	return {
		token: configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN')
	}
}
