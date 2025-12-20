export type NpdAuthResponse = {
	accessToken: string
	refreshToken: string
}

export type CreateIncomeItem = {
	name: string
	amount: number
	quantity: number
}

export type CreateIncomeResponse = {
	receiptUuid: string
	totalAmount: number
	operationTime: string
}

export enum CancelComment {
	MISTAKE = 'MISTAKE',
	RETURN = 'RETURN',
	SERVICE_ERROR = 'SERVICE_ERROR'
}
