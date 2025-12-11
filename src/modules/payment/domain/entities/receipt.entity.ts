import { randomUUID } from 'crypto'

import { MoneyVO } from '../value-objects/money.vo'

export class ReceiptEntity {
	public constructor(
		public id: string,
		public paymentId: string,
		public status: string,
		public amount: MoneyVO,
		public items: any,
		public raw?: any,
		public fiscalProviderId?: string,
		public errorMessage?: string
	) {}

	public static create(props: {
		paymentId: string
		amount: MoneyVO
		items: any[]
	}) {
		return new ReceiptEntity(
			randomUUID(),
			props.paymentId,
			'PENDING',
			props.amount,
			props.items
		)
	}

	public markSucceeded(raw: any, fiscalProviderId: string) {
		this.status = 'SUCCESS'
		this.raw = raw
		this.fiscalProviderId = fiscalProviderId
	}

	public markFailed(error: string) {
		this.status = 'FAILED'
		this.errorMessage = error
	}
}
