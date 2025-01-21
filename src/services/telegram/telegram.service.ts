import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/generated'
import { Ctx, Start, Update } from 'nestjs-telegraf'
import { Context, Telegraf } from 'telegraf'

// import type { SessionMetadata } from '@/shared/types/session.interface.'
import { PrismaService } from '@/infra/prisma/prisma.service'

import { MESSAGES } from './telegram.messages'

@Update()
@Injectable()
export class TelegramService extends Telegraf {
	private readonly _token: string

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService
	) {
		super(configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN'))
		this._token = configService.getOrThrow<string>('TELEGRAM_BOT_TOKEN')
	}

	@Start()
	public async onStart(@Ctx() ctx: Context) {
		const chatId = ctx.chat.id.toString()
		const ownerId =
			this.configService.getOrThrow<string>('TELEGRAM_OWNER_ID')

		if (chatId !== ownerId) {
			await ctx.reply(MESSAGES.botUnavailable)
			return
		}

		await ctx.replyWithHTML(MESSAGES.welcomeMessage)
	}

	public async sendNewUser(user: User) {
		const ownerId =
			this.configService.getOrThrow<string>('TELEGRAM_OWNER_ID')

		const count = await this.prismaService.user.count()

		// await this.telegram.sendMessage(
		// 	ownerId,
		// 	MESSAGES.newUserMessage(user, metadata, count),
		// 	{
		// 		parse_mode: 'HTML'
		// 	}
		// )
	}
}
