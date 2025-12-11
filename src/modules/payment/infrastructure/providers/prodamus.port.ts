import { PaymentEntity } from '../../domain/entities/payment.entity'

export abstract class ProdamusPort {
	public abstract createPayment(
		payment: PaymentEntity,
		email: string
	): Promise<{
		id: string
		url: string
		raw: Record<string, any>
	}>
}
