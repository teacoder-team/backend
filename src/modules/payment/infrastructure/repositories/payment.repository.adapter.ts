import { Injectable } from '@nestjs/common'
import { desc, eq } from 'drizzle-orm'

import { DatabaseService } from '@/infra/database/database.service'
import { payments } from '@/infra/database/drizzle/schema'

import { PaymentEntity } from '../../domain/entities/payment.entity'
import { PaymentRepositoryPort } from '../../domain/repositories/payment.repository.port'

const PaymentMethodMap = {
	BANK_CARD: 'BANK_CARD',
	SBP: 'SBP',
	T_PAY: 'T_PAY',
	SBER_PAY: 'SBER_PAY',
	YOOMONEY: 'YOOMONEY',
	CRYPTO: 'CRYPTO',
	INTERNATIONAL_CARD: 'INTERNATIONAL_CARD',
	TELEGRAM_STARS: 'TELEGRAM_STARS'
} as const

@Injectable()
export class PaymentRepositoryAdapter implements PaymentRepositoryPort {
	public constructor(private readonly db: DatabaseService) {}

	public async save(entity: PaymentEntity) {
		await this.db.db.insert(payments).values({
			id: entity.id,
			userId: entity.userId,
			amount: entity.amount.value.toString(),
			currency: entity.amount.currency,
			method: PaymentMethodMap[entity.method.value],
			status: entity.status.value,
			metadata: entity.metadata
		})
	}

	public async update(entity: PaymentEntity) {
		await this.db.db
			.update(payments)
			.set({
				providerPaymentId: entity.providerPaymentId,
				metadata: entity.metadata,
				status: entity.status.value
			})
			.where(eq(payments.id, entity.id))
	}

	public async findById(id: string) {
		const [row] = await this.db.db
			.select()
			.from(payments)
			.where(eq(payments.id, id))
			.limit(1)

		return row ? this.mapToEntity(row) : null
	}

	public async findLastSuccess(userId: string) {
		const [row] = await this.db.db
			.select()
			.from(payments)
			.where(eq(payments.userId, userId))
			.orderBy(desc(payments.createdAt))
			.limit(1)

		return row ? this.mapToEntity(row) : null
	}

	private mapToEntity(row: any): PaymentEntity {
		return new PaymentEntity(
			row.id,
			row.userId,
			{ value: Number(row.amount), currency: row.currency },
			{ value: row.method },
			{ value: row.status },
			row.providerPaymentId,
			row.metadata,
			row.subscriptionId
		)
	}
}
