import { ConfigService } from '@nestjs/config'
import { Ctx, InjectBot, Start, Update } from 'nestjs-telegraf'
import { Context, Telegraf } from 'telegraf'

import type { AllConfigs } from '@/config/definitions'

import { MESSAGES } from '../../shared/messages'

@Update()
export class StartCommand {
	private readonly OWNER_ID: string

	public constructor(
		@InjectBot('teamanager') private readonly bot: Telegraf,
		private readonly configService: ConfigService<AllConfigs>
	) {
		this.OWNER_ID = this.configService.get('telegram.ownerId', {
			infer: true
		})
	}

	@Start()
	public async handle(@Ctx() ctx: Context) {
		const chatId = ctx.chat.id.toString()

		if (chatId !== this.OWNER_ID) {
			await this.bot.telegram.sendMessage(chatId, MESSAGES.botUnavailable)
			return
		}

		await this.bot.telegram.sendMessage(chatId, MESSAGES.welcomeMessage, {
			parse_mode: 'HTML'
		})
	}
}
