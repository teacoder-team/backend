export interface CreatePaymentRequest {
	invId: string
	outSum: number
	description: string
	email?: string
	culture?: string
}
