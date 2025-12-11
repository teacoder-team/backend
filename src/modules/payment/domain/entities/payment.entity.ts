import { randomUUID } from 'crypto'

import { MoneyVO } from '../value-objects/money.vo'
import { PaymentMethodVO } from '../value-objects/payment-method.vo'
import { PaymentStatusVO } from '../value-objects/payment-status.vo'

export class PaymentEntity {
	public constructor(
		public id: string,
		public userId: string,
		public amount: MoneyVO,
		public method: PaymentMethodVO,
		public status: PaymentStatusVO,
		public providerPaymentId?: string,
		public metadata?: any,
		public subscriptionId?: string
	) {}

	public static create(props: {
		userId: string
		amount: MoneyVO
		method: PaymentMethodVO
	}) {
		return new PaymentEntity(
			randomUUID(),
			props.userId,
			props.amount,
			props.method,
			PaymentStatusVO.pending()
		)
	}

	public markSucceeded(metadata: any, providerPaymentId?: string) {
		this.status = PaymentStatusVO.success()
		this.metadata = metadata
		this.providerPaymentId = providerPaymentId
	}

	public markFailed() {
		this.status = PaymentStatusVO.failed()
	}
}
