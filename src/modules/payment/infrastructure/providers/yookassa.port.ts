import { PaymentEntity } from '@/modules/payment/domain/entities/payment.entity'

export abstract class YookassaPort {
	public abstract createPayment(
		payment: PaymentEntity,
		email: string
	): Promise<{
		id: string
		url: string
		raw: Record<string, any>
	}>
	public abstract capturePayment(providerPaymentId: string): Promise<any>
	public abstract createInvoice(data: {
		payment: PaymentEntity
		email: string
	}): Promise<any>
}
