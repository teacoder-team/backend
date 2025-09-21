import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type {
	Payment,
	Subscription,
	User,
	UserPaymentMethod
} from '@prisma/generated'
import { InjectBot } from 'nestjs-telegraf'
import { Telegraf } from 'telegraf'

import { PrismaService } from '@/infra/prisma/prisma.service'

import { MESSAGES } from './bot.messages'

@Injectable()
export class BotService {
	private readonly OWNER_ID: string

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		@InjectBot() private readonly bot: Telegraf
	) {
		this.OWNER_ID =
			this.configService.getOrThrow<string>('TELEGRAM_OWNER_ID')
	}

	public async sendNewUser(user: User, session: any) {
		const count = await this.prismaService.user.count()

		await this.bot.telegram.sendMessage(
			this.OWNER_ID,
			MESSAGES.newUser(user, session, count),
			{
				parse_mode: 'HTML'
			}
		)
	}
}
