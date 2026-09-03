export const API_URL = 'https://lknpd.nalog.ru/api/v1'

export interface DeviceInfo {
	sourceDeviceId: string
	sourceType: 'WEB'
	appVersion: string
	metaDetails: { userAgent: string }
}

export interface Profile {
	id: number
	displayName: string
	inn: string
	email: string | null
	phone: string | null
	snils: string | null
	status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | string
	restrictedMode: boolean
	registrationDate: string
	lastName: string | null
	middleName: string | null
}

export interface AuthResponse {
	token: string
	refreshToken: string
	tokenExpireIn?: string | null
	refreshTokenExpiresIn?: string | null
	profile: Profile
}

export type PaymentType = 'CASH' | 'ACCOUNT' | (string & {})

export type IncomeType =
	| 'FROM_INDIVIDUAL'
	| 'FROM_LEGAL_ENTITY'
	| 'FROM_FOREIGN_AGENCY'
	| (string & {})

export interface ServiceItem {
	name: string
	amount: number
	quantity: number
}

export interface IncomeClient {
	incomeType: IncomeType
	inn?: string | null
	displayName?: string | null
	contactPhone?: string | null
}

export interface CreateIncomeRequest {
	operationTime: string
	requestTime: string
	services: ServiceItem[]
	totalAmount: number
	client: IncomeClient
	paymentType: PaymentType
	ignoreMaxTotalIncomeRestriction: boolean
	deviceId: string
}

export interface CreateIncomeResponse {
	approvedReceiptUuid: string
}

export const CancelReason = {
	MISTAKE: 'Чек сформирован ошибочно',
	RETURN: 'Возврат средств',
} as const

export type CancelReasonCode = keyof typeof CancelReason

export interface ReceiptCancellationInfo {
	operationTime: string
	registerTime: string
	taxPeriodId: number
	comment: string
}

export interface Receipt {
	receiptId: string
	services: ServiceItem[]
	operationTime: string
	requestTime: string
	registerTime: string
	taxPeriodId: number
	paymentType: PaymentType
	incomeType: IncomeType
	totalAmount: number
	cancellationInfo: ReceiptCancellationInfo | null
	sourceDeviceId: string | null
	clientInn: string | null
	clientDisplayName: string | null
	partnerInn: string | null
	partnerDisplayName: string | null
	inn: string
	profession: string
	description: string[]
	email: string | null
	phone: string | null
	invoiceId: string | null
}
