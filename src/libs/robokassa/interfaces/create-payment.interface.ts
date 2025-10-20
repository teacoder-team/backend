export interface CreatePaymentRequest {
	invId?: number
	outSum: number
	description: string
	email?: string
	resultUrl?: string
	successUrl?: string
	failUrl?: string
	culture?: string
	shps?: Record<string, string>
	incCurrLabel?: string
	paymentMethods?: string[]
	expirationDate?: string
	encoding?: string
	isRecurring?: boolean
}
