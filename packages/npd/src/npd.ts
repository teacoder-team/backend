import { createRequest, NpdError } from './client'
import { createSession } from './session'
import {
	API_URL,
	CancelReason,
	type CancelReasonCode,
	type CreateIncomeResponse,
	type IncomeClient,
	type NpdClientOptions,
	type PaymentType,
	type Receipt,
	type ServiceItem
} from './types'

const INN_LENGTH = { company: 10, entrepreneur: 12 }

const round = (value: number) => Math.round(value * 100) / 100

const totalOf = (services: ServiceItem[]) =>
	round(services.reduce((sum, service) => sum + round(service.amount * service.quantity), 0))

const validate = (services: ServiceItem[], client: IncomeClient) => {
	if (!services.length) {
		throw new NpdError(0, 'A receipt needs at least one service line')
	}

	for (const service of services) {
		if (!service.name.trim()) {
			throw new NpdError(0, 'Every service line needs a name')
		}

		if (!(service.amount > 0)) {
			throw new NpdError(0, `Amount for "${service.name}" must be greater than zero`)
		}

		if (!(service.quantity > 0)) {
			throw new NpdError(0, `Quantity for "${service.name}" must be greater than zero`)
		}
	}

	if (client.incomeType === 'FROM_LEGAL_ENTITY' && !client.inn) {
		throw new NpdError(0, 'A legal entity client requires an INN')
	}

	if (client.inn && !/^\d{10}$|^\d{12}$/.test(client.inn)) {
		throw new NpdError(
			0,
			`Client INN must be ${INN_LENGTH.company} or ${INN_LENGTH.entrepreneur} digits`
		)
	}
}

export interface IssueReceiptInput {

	services: ServiceItem[]

	client?: Partial<IncomeClient>
	paymentType?: PaymentType

	operationTime?: Date
}

export interface IssuedReceipt {
	receiptId: string
	totalAmount: number
	printUrl: string
}

export interface CancelReceiptInput {
	receiptId: string
	reason: CancelReasonCode
	operationTime?: Date
}

export const createNpdClient = (options: NpdClientOptions) => {
	const { logger } = options
	const session = createSession(options)
	const request = createRequest(session, logger)

	const getReceiptPrintUrl = async (receiptId: string) =>
		`${API_URL}/receipt/${await session.getAccountInn()}/${receiptId}/print`

	const getReceipt = async (receiptId: string) =>
		request<Receipt>(`/receipt/${await session.getAccountInn()}/${receiptId}/json`)

	const issueReceipt = async ({
		services,
		client = {},
		paymentType = 'CASH',
		operationTime = new Date()
	}: IssueReceiptInput): Promise<IssuedReceipt> => {
		const incomeClient: IncomeClient = {
			incomeType: client.incomeType ?? 'FROM_INDIVIDUAL',
			inn: client.inn ?? null,
			displayName: client.displayName ?? null,
			contactPhone: client.contactPhone ?? null
		}

		validate(services, incomeClient)

		const totalAmount = totalOf(services)

		const { approvedReceiptUuid } = await request<CreateIncomeResponse>('/income', {
			method: 'POST',
			retryable: false,
			body: {
				operationTime: operationTime.toISOString(),
				requestTime: new Date().toISOString(),
				services: services.map((service) => ({
					name: service.name,
					amount: round(service.amount),
					quantity: service.quantity
				})),
				totalAmount,
				client: incomeClient,
				paymentType,
				ignoreMaxTotalIncomeRestriction: false,
				deviceId: session.deviceId
			}
		})

		logger?.info(
			{ context: 'npd', receiptId: approvedReceiptUuid, totalAmount },
			'npd_receipt_issued'
		)

		return {
			receiptId: approvedReceiptUuid,
			totalAmount,
			printUrl: await getReceiptPrintUrl(approvedReceiptUuid)
		}
	}

	const cancelReceipt = async ({
		receiptId,
		reason,
		operationTime = new Date()
	}: CancelReceiptInput) => {
		await request('/cancel', {
			method: 'POST',
			retryable: false,
			body: {
				operationTime: operationTime.toISOString(),
				requestTime: new Date().toISOString(),
				comment: CancelReason[reason],
				receiptUuid: receiptId,
				partnerCode: null
			}
		})

		logger?.info({ context: 'npd', receiptId, reason }, 'npd_receipt_cancelled')
	}

	return {
		issueReceipt,
		cancelReceipt,
		getReceipt,
		getReceiptPrintUrl,
		getProfile: session.getProfile,
		resetSession: session.reset
	}
}

export type NpdClient = ReturnType<typeof createNpdClient>
