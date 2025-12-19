import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { DRIZZLE_DB } from '@/infra/database/drizzle/drizzle.provider'
import { receipts } from '@/infra/database/drizzle/schema'

import { ReceiptEntity } from '../../domain/entities/receipt.entity'
import { ReceiptRepositoryPort } from '../../domain/repositories/receipt.repository.port'
import { MoneyVO } from '../../domain/value-objects/money.vo'

@Injectable()
export class ReceiptRepositoryAdapter implements ReceiptRepositoryPort {
	public constructor(
		@Inject(DRIZZLE_DB) private readonly db: NodePgDatabase
	) {}

	public async save(receipt: ReceiptEntity) {
		await this.db.insert(receipts).values({
			id: receipt.id,
			paymentId: receipt.paymentId,
			status: receipt.status,
			amount: receipt.amount.value.toString(),
			items: receipt.items,
			raw: receipt.raw ?? null,
			fiscalProviderId: receipt.fiscalProviderId ?? null,
			errorMessage: receipt.errorMessage ?? null
		})
	}

	public async update(receipt: ReceiptEntity) {
		await this.db
			.update(receipts)
			.set({
				status: receipt.status,
				raw: receipt.raw,
				fiscalProviderId: receipt.fiscalProviderId,
				errorMessage: receipt.errorMessage
			})
			.where(eq(receipts.id, receipt.id))
	}

	public async findByPaymentId(paymentId: string) {
		const [row] = await this.db
			.select()
			.from(receipts)
			.where(eq(receipts.paymentId, paymentId))
			.limit(1)

		return row
			? new ReceiptEntity(
					row.id,
					row.paymentId,
					row.status,
					MoneyVO.create(Number(row.amount)),
					row.items,
					row.raw,
					row.fiscalProviderId,
					row.errorMessage
				)
			: null
	}
}
