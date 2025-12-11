import { Injectable } from '@nestjs/common'
import { User } from '@prisma/generated'

import { PaymentEntity } from '../../domain/entities/payment.entity'
import { ReceiptEntity } from '../../domain/entities/receipt.entity'
import { PaymentRepositoryPort } from '../../domain/repositories/payment.repository.port'
import { ReceiptRepositoryPort } from '../../domain/repositories/receipt.repository.port'
import { MoneyVO } from '../../domain/value-objects/money.vo'
import { PaymentMethodVO } from '../../domain/value-objects/payment-method.vo'
import { HeleketPort } from '../../infrastructure/providers/heleket.port'
import { ProdamusPort } from '../../infrastructure/providers/prodamus.port'
import { YookassaPort } from '../../infrastructure/providers/yookassa.port'

@Injectable()
export class InitPaymentUseCase {
	private readonly BASE_SUBSCRIPTION_PRICE = 349

	private readonly INTERNATIONAL_CARD_FEE_PERCENT = 15

	public constructor(
		private readonly payments: PaymentRepositoryPort,
		private readonly receipts: ReceiptRepositoryPort,
		private readonly yookassa: YookassaPort,
		private readonly prodamus: ProdamusPort,
		private readonly heleket: HeleketPort
	) {}

	public async execute(dto: { method: string; user: User }) {
		const finalPrice = this.getPriceForMethod(dto.method)

		const payment = PaymentEntity.create({
			userId: dto.user.id,
			amount: MoneyVO.create(finalPrice),
			method: PaymentMethodVO.create(dto.method)
		})

		await this.payments.save(payment)

		const receipt = ReceiptEntity.create({
			paymentId: payment.id,
			amount: MoneyVO.create(finalPrice),
			items: [
				{
					name: 'Премиум-доступ на 30 дней',
					price: finalPrice,
					quantity: 1,
					total: finalPrice
				}
			]
		})

		await this.receipts.save(receipt)

		const providerResponse = await this.dispatchProvider(
			dto.method,
			payment,
			dto.user.email
		)

		payment.providerPaymentId = providerResponse.id
		payment.metadata = providerResponse

		await this.payments.update(payment)

		return {
			url: providerResponse?.url
		}
	}

	private async dispatchProvider(
		method: string,
		payment: PaymentEntity,
		email: string
	) {
		switch (method) {
			case 'BANK_CARD':
			case 'SBP':
			case 'T_PAY':
				return this.yookassa.createPayment(payment, email)
			case 'INTERNATIONAL_CARD':
				return this.prodamus.createPayment(payment, email)
			case 'CRYPTO':
				return this.heleket.createPayment(payment)
			default:
				throw new Error('Unsupported payment method')
		}
	}

	private getPriceForMethod(method: string): number {
		switch (method) {
			case 'INTERNATIONAL_CARD': {
				const fee =
					this.BASE_SUBSCRIPTION_PRICE *
					(this.INTERNATIONAL_CARD_FEE_PERCENT / 100)

				return Math.ceil(this.BASE_SUBSCRIPTION_PRICE + fee)
			}

			default:
				return this.BASE_SUBSCRIPTION_PRICE
		}
	}
}
