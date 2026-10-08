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

/** Roubles have two decimals; float arithmetic does not. */
const round = (value: number) => Math.round(value * 100) / 100

const totalOf = (services: ServiceItem[]) =>
	round(services.reduce((sum, service) => sum + round(service.amount * service.quantity), 0))

/**
 * The service answers a malformed payload with an opaque 400, so the payload is
 * checked here where the message can actually say what is wrong.
 */
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
	/** One line per item. The total is derived, never passed in. */
	services: ServiceItem[]
	/** Defaults to an anonymous individual, which is the common case. */
	client?: Partial<IncomeClient>
	paymentType?: PaymentType
	/** When the money actually arrived. Defaults to now. */
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

/** Client for "Мой налог" (lknpd.nalog.ru) - the self-employed tax service. */
export const createNpdClient = (options: NpdClientOptions) => {
	const { logger } = options
	const session = createSession(options)
	const request = createRequest(session, logger)

	/** A public link — no token needed, so it is safe to hand to the payer. */
	const getReceiptPrintUrl = async (receiptId: string) =>
		`${API_URL}/receipt/${await session.getAccountInn()}/${receiptId}/print`

	const getReceipt = async (receiptId: string) =>
		request<Receipt>(`/receipt/${await session.getAccountInn()}/${receiptId}/json`)

	/**
	 * Registers an income and returns the receipt.
	 *
	 * Not idempotent and not retried: the API has no idempotency key, so a repeat
	 * files a second receipt and a second tax liability. A caller that cannot tell
	 * whether this succeeded should look the receipt up, not call again.
	 */
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
