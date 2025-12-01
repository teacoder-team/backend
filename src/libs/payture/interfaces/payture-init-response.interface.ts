export interface PaytureInitPaymentResponseSuccess {
	Success: 'True'
	OrderId: string
	Amount: string
	SessionLifeTime?: string
	AttemptsCount?: string
	SessionId: string
	ErrCode?: undefined
}

export interface PaytureInitPaymentResponseError {
	Success: 'False'
	ErrCode?: string
	OrderId?: string
	Amount?: string
	SessionId?: string
}

export type PaytureInitPaymentResponse =
	| PaytureInitPaymentResponseSuccess
	| PaytureInitPaymentResponseError
