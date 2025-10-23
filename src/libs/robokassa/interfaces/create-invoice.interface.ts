export interface RobokassaInvoiceItem {
	Name: string
	Quantity: number
	Cost: number
	Tax?: 'vat0' | 'vat10' | 'vat20' | 'vat110' | 'vat120'
	PaymentMethod?: 'full_payment' | 'full_prepayment' | 'advance'
	PaymentObject?: 'commodity' | 'service'
	NomenclatureCode?: string
}

export interface CreateInvoiceRequest {
	InvoiceType: 'OneTime' | 'Reusable'
	Culture?: string
	InvId: number
	OutSum: number
	Description: string
	MerchantComments?: string
	UserFields?: Record<string, string>
	InvoiceItems: RobokassaInvoiceItem[]
	SuccessUrl2Data?: {
		Url: string
		Method: 'GET' | 'POST'
	}
	FailUrl2Data?: {
		Url: string
		Method: 'GET' | 'POST'
	}
}
