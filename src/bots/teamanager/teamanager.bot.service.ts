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

import type { AllConfigs } from '@/config/definitions'
import { PrismaService } from '@/infra/prisma/prisma.service'

import { MESSAGES } from '../shared/messages'

@Injectable()
export class TeamanagerBotService {
	private readonly OWNER_ID: string

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService<AllConfigs>,
		@InjectBot('teamanager') private readonly bot: Telegraf
	) {
		this.OWNER_ID = this.configService.get('telegram.ownerId', {
			infer: true
		})
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

	public async sendSubscriptionPurchased(
		user: User,
		payment: Payment & { paymentMethod?: UserPaymentMethod | null },
		subscription: Subscription
	) {
		await this.bot.telegram.sendMessage(
			this.OWNER_ID,
			MESSAGES.subscriptionPurchased(user, payment, subscription),
			{
				parse_mode: 'HTML'
			}
		)
	}
}
