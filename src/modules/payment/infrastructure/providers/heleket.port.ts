import { PaymentEntity } from '@/modules/payment/domain/entities/payment.entity'

export abstract class HeleketPort {
	public abstract createPayment(payment: PaymentEntity): Promise<{
		uuid?: string
		url?: string
		[key: string]: any
	}>
	public abstract verifyWebhook(ip: string, payload: any): boolean
}
