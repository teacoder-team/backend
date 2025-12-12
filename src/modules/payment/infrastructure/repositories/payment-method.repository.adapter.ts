import { BadRequestException, Injectable } from '@nestjs/common'
import { PaymentMethod } from '@prisma/generated'
import { eq } from 'drizzle-orm'

import { DatabaseService } from '@/infra/database/database.service'
import { userPaymentMethods } from '@/infra/database/drizzle/schema'

import { PaymentMethodRepositoryPort } from '../../domain/repositories/payment-method.repository.port'

@Injectable()
export class PaymentMethodRepositoryAdapter
	implements PaymentMethodRepositoryPort
{
	private readonly paymentTypeMap: Record<string, PaymentMethod> = {
		bank_card: 'BANK_CARD',
		sbp: 'SBP',
		tinkoff_bank: 'T_PAY',
		yoo_money: 'YOOMONEY'
	}

	public constructor(private readonly db: DatabaseService) {}

	public async saveOrUpdate(userId: string, paymentMethod: any) {
		if (!paymentMethod)
			throw new BadRequestException(
				'payment_method object is missing in YooKassa webhook'
			)

		const { id, type, title, card, status } = paymentMethod

		if (!id || !type) {
			throw new BadRequestException(
				`Invalid payment_method payload: missing id or type`
			)
		}

		const resolvedTitle =
			type === 'tinkoff_bank' ? 'T-Pay' : title || 'Unknown'

		const expiryMonth =
			card?.expiry_month && /^\d+$/.test(card.expiry_month)
				? Number(card.expiry_month)
				: null

		const expiryYear =
			card?.expiry_year && /^\d+$/.test(card.expiry_year)
				? Number(card.expiry_year)
				: null

		const mappedType =
			this.paymentTypeMap[type] ??
			(() => {
				throw new BadRequestException(
					`Unsupported payment method type: ${type}`
				)
			})()

		const existing = await this.db.db
			.select()
			.from(userPaymentMethods)
			.where(eq(userPaymentMethods.providerId, id))
			.limit(1)

		if (existing.length) {
			await this.db.db
				.update(userPaymentMethods)
				.set({
					title: resolvedTitle,
					type: mappedType,
					first6: card?.first6 ?? null,
					last4: card?.last4 ?? null,
					cardType: card?.card_type ?? null,
					expiryMonth,
					expiryYear,
					isActive: status === 'active',
					metadata: paymentMethod,
					updatedAt: new Date()
				})
				.where(eq(userPaymentMethods.providerId, id))

			return { ...existing[0], title: resolvedTitle }
		}

		const [row] = await this.db.db
			.insert(userPaymentMethods)
			.values({
				provider: 'YOOKASSA',
				userId,
				providerId: id,
				title: resolvedTitle,
				type: mappedType,
				first6: card?.first6 ?? null,
				last4: card?.last4 ?? null,
				cardType: card?.card_type ?? null,
				expiryMonth,
				expiryYear,
				isActive: status === 'active',
				metadata: paymentMethod
			})
			.returning()

		return row
	}
}
