import { PaymentEntity } from '@/modules/payment/domain/entities/payment.entity'

export abstract class HeleketPort {
	public abstract createPayment(payment: PaymentEntity): Promise<{
		id: string
		url: string
		raw: Record<string, any>
	}>
	public abstract verifyWebhook(ip: string, payload: any): boolean
}
