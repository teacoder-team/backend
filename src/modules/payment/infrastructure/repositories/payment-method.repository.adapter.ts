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
		this.logger.debug(
			`saveOrUpdate called for user=${userId}, provider=YOOKASSA`
		)

		if (!paymentMethod) {
			this.logger.error(
				`payment_method is missing in YooKassa webhook (user=${userId})`
			)

			throw new BadRequestException(
				'payment_method object is missing in YooKassa webhook'
			)
		}

		const { id, type, title, card, status } = paymentMethod

		this.logger.debug(
			`Incoming payment_method: id=${id}, type=${type}, status=${status}`
		)

		if (!id || !type) {
			this.logger.error(
				`Invalid payment_method payload: missing id or type (user=${userId})`
			)
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

		const mappedType = this.paymentTypeMap[type]

		if (!mappedType) {
			this.logger.error(
				`Unsupported payment method type=${type} (providerId=${id}, user=${userId})`
			)
			throw new BadRequestException(
				`Unsupported payment method type: ${type}`
			)
		}

		this.logger.debug(
			`Mapped payment method type: ${type} -> ${mappedType}`
		)

		const existing = await this.db
			.select()
			.from(userPaymentMethods)
			.where(eq(userPaymentMethods.providerId, id))
			.limit(1)

		if (existing.length) {
			this.logger.log(
				`Updating existing payment method providerId=${id} for user=${userId}`
			)

			await this.db
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

			this.logger.debug(
				`Payment method providerId=${id} updated successfully`
			)

			return { ...existing[0], title: resolvedTitle }
		}

		this.logger.log(
			`Creating new payment method providerId=${id} for user=${userId}`
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
			.returning()

		this.logger.debug(
			`Payment method providerId=${id} created successfully for user=${userId}`
		)

		return row
	}
}
