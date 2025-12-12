import { Injectable } from '@nestjs/common'

import { TeamanagerBotService } from '@/api/bots/teamanager/teamanager.bot.service'
import { MailService } from '@/libs/mail/mail.service'

import { PaymentEntity } from '../../domain/entities/payment.entity'
import { PaymentNotifierPort } from '../../domain/repositories/payment-notifier.port'
import { SubscriptionEntity } from '../../domain/repositories/subscription.repository.port'
import { UserEntity } from '../../domain/repositories/user.repository.port'

@Injectable()
export class PaymentNotifierAdapter implements PaymentNotifierPort {
	public constructor(
		private readonly mailService: MailService,
		private readonly botService: TeamanagerBotService
	) {}

	public async notifySuccess(
		user: UserEntity,
		payment: PaymentEntity,
		subscription: SubscriptionEntity
	): Promise<void> {
		await this.mailService.sendSubscriptionSuccess(
			user,
			payment,
			subscription
		)

		await this.botService.sendSubscriptionPurchased(
			user,
			payment,
			subscription
		)
	}
}
