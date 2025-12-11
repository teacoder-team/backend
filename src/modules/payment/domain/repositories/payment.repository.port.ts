import { PaymentEntity } from '../entities/payment.entity'

export abstract class PaymentRepositoryPort {
	public abstract save(payment: PaymentEntity): Promise<void>
	public abstract update(payment: PaymentEntity): Promise<void>
	public abstract findById(id: string): Promise<PaymentEntity | null>
	public abstract findLastSuccess(
		userId: string
	): Promise<PaymentEntity | null>
}
