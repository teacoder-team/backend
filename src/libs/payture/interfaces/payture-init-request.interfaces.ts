export interface PaytureInitPaymentRequest {
	type: 'Pay' | 'Block'
	orderId: string
	amount: number
	total?: number
	url?: string
	product?: string
	phone?: string
	description?: string
	ip?: string
	cheque?: any
	additional?: Record<string, string | number>
}
