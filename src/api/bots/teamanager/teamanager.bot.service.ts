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
import { PaymentEntity } from '@/modules/payment/domain/entities/payment.entity'
import { SubscriptionEntity } from '@/modules/payment/domain/repositories/subscription.repository.port'
import { UserEntity } from '@/modules/payment/domain/repositories/user.repository.port'

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
		user: UserEntity,
		payment: PaymentEntity,
		subscription: SubscriptionEntity
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
