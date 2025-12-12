export interface PaymentMethodEntity {
	id: string
	userId: string
	title: string
	type: string
	first6?: string | null
	last4?: string | null
	cardType?: string | null
	expiryMonth?: number | null
	expiryYear?: number | null
	isActive: boolean
	metadata: any
}

export abstract class PaymentMethodRepositoryPort {
	public abstract saveOrUpdate(
		userId: string,
		methodData: any
	): Promise<PaymentMethodEntity>
}
