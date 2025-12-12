import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { PaymentMethod } from '@prisma/generated'

import { NormalizedCallbackDto } from '@/modules/payment/infrastructure/webhook/dto/normalized-callback.dto'

import { PaymentMethodRepositoryPort } from '../../domain/repositories/payment-method.repository.port'
import { PaymentNotifierPort } from '../../domain/repositories/payment-notifier.port'
import { PaymentRepositoryPort } from '../../domain/repositories/payment.repository.port'
import { SubscriptionRepositoryPort } from '../../domain/repositories/subscription.repository.port'
import { UserRepositoryPort } from '../../domain/repositories/user.repository.port'
import { MoneyVO } from '../../domain/value-objects/money.vo'

@Injectable()
export class ProcessWebhookUseCase {
	private readonly logger = new Logger(ProcessWebhookUseCase.name)

	public constructor(
		private readonly paymentRepo: PaymentRepositoryPort,
		private readonly subscriptionRepo: SubscriptionRepositoryPort,
		private readonly userRepo: UserRepositoryPort,
		private readonly paymentMethodRepo: PaymentMethodRepositoryPort,
		private readonly notifier: PaymentNotifierPort
	) {}

	public async execute(dto: NormalizedCallbackDto) {
		const { provider, isSuccess, paymentId, amount, raw } = dto

		this.logger.log(`🔄 Processing payment ${paymentId} via [${provider}]`)

		const payment = await this.paymentRepo.findById(paymentId)

		if (!payment) {
			this.logger.error(`❌ Payment not found: ${paymentId}`)
			throw new BadRequestException('Payment not found')
		}

		const user = await this.userRepo.findById(payment.userId)

		if (!user) throw new BadRequestException('User not found')

		if (!isSuccess) {
			this.logger.warn(
				`⚠️ Payment ${paymentId} FAILED via ${provider}, marking as FAILED`
			)

			payment.markFailed()
			await this.paymentRepo.update(payment)

			return
		}

		let paymentMethodId = null

		if (provider === 'yookassa') {
			this.logger.log(`Saving payment method for user ${user.id}`)

			const method = await this.paymentMethodRepo.saveOrUpdate(
				user.id,
				raw.payment_method
			)

			paymentMethodId = method.id
		}

		payment.markSucceeded(raw)

		if (provider === 'heleket')
			payment.amount = MoneyVO.create(
				Number(raw.payer_amount),
				raw.payer_currency
			)

		if (paymentMethodId) payment.paymentMethodId = paymentMethodId

		await this.paymentRepo.update(payment)

		this.logger.log(`Payment ${paymentId} marked as SUCCESS`)

		if (!user.isAutoBilling && provider === 'yookassa') {
			await this.userRepo.enableAutoBilling(user.id)
			this.logger.log(`Auto-billing enabled for user ${user.id}`)
		}

		const subscription = await this.subscriptionRepo.extendSubscription(
			user.id
		)

		this.logger.log(
			`Subscription updated for user ${user.id}, expires ${subscription.expiresAt.toISOString()}`
		)

		payment.subscriptionId = subscription.id
		await this.paymentRepo.update(payment)

		await this.notifier.notifySuccess(user, payment, subscription)
	}
}
