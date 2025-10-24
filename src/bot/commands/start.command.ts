import { ConfigService } from '@nestjs/config'
import { Ctx, Start, Update } from 'nestjs-telegraf'
import { Context } from 'telegraf'

import type { AllConfigs } from '@/config/definitions'

import { MESSAGES } from '../bot.messages'

@Update()
export class StartCommand {
	private readonly OWNER_ID: string

	public constructor(
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
			await ctx.reply(MESSAGES.botUnavailable)
			return
		}

		await ctx.replyWithHTML(MESSAGES.welcomeMessage)
	}
}
