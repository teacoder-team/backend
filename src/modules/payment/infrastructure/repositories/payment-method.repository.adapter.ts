import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { PaymentMethod } from '@prisma/generated'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { DRIZZLE_DB } from '@/infra/database/drizzle/drizzle.provider'
import { userPaymentMethods } from '@/infra/database/drizzle/schema'

import { PaymentMethodRepositoryPort } from '../../domain/repositories/payment-method.repository.port'

@Injectable()
export class PaymentMethodRepositoryAdapter
	implements PaymentMethodRepositoryPort
{
	private readonly logger = new Logger(PaymentMethodRepositoryAdapter.name)

	private readonly paymentTypeMap: Record<string, PaymentMethod> = {
		bank_card: 'BANK_CARD',
		sbp: 'SBP',
		tinkoff_bank: 'T_PAY',
		yoo_money: 'YOOMONEY'
	}

	public constructor(
		@Inject(DRIZZLE_DB)
		private readonly db: NodePgDatabase
	) {}

	public async saveOrUpdate(userId: string, paymentMethod: any) {
		if (!paymentMethod) {
			throw new BadRequestException(
				'payment_method object is missing in YooKassa webhook'
			)
		}

		const { id, type, title, card, status } = paymentMethod

		if (!id || !type) {
			throw new BadRequestException(
				'Invalid payment_method payload: missing id or type'
			)
		}

		const mappedType = this.paymentTypeMap[type]

		if (!mappedType) {
			throw new BadRequestException(
				`Unsupported payment method type: ${type}`
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

		this.logger.log(
			`Upserting payment method providerId=${id} for user=${userId}`
		)

		const [row] = await this.db
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
			.onConflictDoUpdate({
				target: userPaymentMethods.providerId,
				set: {
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
				}
			})
			.returning()

		this.logger.debug(
			`Payment method saved: id=${row.id}, providerId=${row.providerId}`
		)

		return row
	}
}
