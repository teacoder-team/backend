import { createHash, timingSafeEqual } from 'node:crypto'

import { createHttpClient, HttpError, type HttpLogger } from '@teacoder/http'

const CURRENCY = 'RUB'

export interface HeleketClientOptions {
	merchantId: string

	apiKey: string

	timeout?: number
	logger?: HttpLogger
}

interface SuccessEnvelope<T> {
	state: 0
	result: T
}

interface ErrorEnvelope {
	state: 1
	message?: string
	errors?: Record<string, string[]>
}

type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope

export class HeleketError extends Error {
	constructor(
		readonly status: number,
		readonly fieldErrors: Record<string, string[]> | null,
		message: string
	) {
		super(message)
		this.name = 'HeleketError'
	}
}

export type PaymentStatus =
	| 'confirm_check'
	| 'paid'
	| 'paid_over'
	| 'fail'
	| 'wrong_amount'
	| 'cancel'
	| 'system_fail'
	| 'refund_process'
	| 'refund_fail'
	| 'refund_paid'

export interface Invoice {
	uuid: string
	order_id: string
	amount: string
	payment_amount: string | null
	payer_amount: string | null
	payer_currency: string | null
	currency: string
	network: string | null
	address: string | null
	from: string | null
	txid: string | null
	payment_status: PaymentStatus
	is_final: boolean
	url: string
	expired_at: number
	additional_data: string | null
	created_at: string
	updated_at: string
}

export interface CreateInvoiceInput {
	orderId: string
	amount: number

	returnUrl?: string

	successUrl?: string

	callbackUrl?: string

	lifetime?: number

	additionalData?: string
}

export type PaymentIdentifier = { uuid: string } | { orderId: string }

export interface WebhookPayload {
	type: string
	uuid: string
	order_id: string
	amount: string
	payment_amount: string
	merchant_amount: string
	commission: string
	is_final: boolean
	status: PaymentStatus
	from: string | null
	network: string | null
	currency: string
	payer_currency: string | null
	additional_data: string | null
	txid: string | null
	sign: string
}

const messageFor = (envelope: ErrorEnvelope) => {
	if (envelope.message) {
		return envelope.message
	}

	const fieldMessages = Object.values(envelope.errors ?? {})
		.flat()
		.join('; ')

	return fieldMessages || 'Unknown error'
}

const phpCompatibleJson = (value: unknown): string => JSON.stringify(value).replace(/\//g, '\\/')

export const createHeleketClient = ({
	merchantId,
	apiKey,
	timeout = 7000,
	logger
}: HeleketClientOptions) => {
	const http = createHttpClient({
		baseURL: 'https://api.heleket.com/v1',
		timeout,
		logger,
		headers: { 'Content-Type': 'application/json', merchant: merchantId },
		retry: { retries: 2, minTimeout: 400, factor: 2 }
	})

	const signBody = (body: unknown): string => {
		const json = body === undefined ? '' : JSON.stringify(body)

		return createHash('md5')
			.update(Buffer.from(json).toString('base64') + apiKey)
			.digest('hex')
	}

	const call = async <T>(method: string, body?: Record<string, unknown>): Promise<T> => {
		try {
			const envelope = await http<Envelope<T>>(`/${method}`, {
				method: 'POST',
				headers: { sign: signBody(body) },
				...(body !== undefined ? { body: JSON.stringify(body) } : {})
			})

			if (envelope.state !== 0) {
				throw new HeleketError(0, envelope.errors ?? null, messageFor(envelope))
			}

			return envelope.result
		} catch (err) {
			if (!(err instanceof HttpError)) {
				throw err
			}

			const errorBody = err.body as Partial<ErrorEnvelope> | null

			throw new HeleketError(
				err.status,
				errorBody?.errors ?? null,
				errorBody?.message ?? `Request failed (${err.status})`
			)
		}
	}

	const createInvoice = (input: CreateInvoiceInput) =>
		call<Invoice>('payment', {
			order_id: input.orderId,
			amount: input.amount.toFixed(2),
			currency: CURRENCY,
			url_return: input.returnUrl,
			url_success: input.successUrl,
			url_callback: input.callbackUrl,
			lifetime: input.lifetime,
			additional_data: input.additionalData
		})

	const getPaymentInfo = (identifier: PaymentIdentifier) =>
		call<Invoice>(
			'payment/info',
			'uuid' in identifier ? { uuid: identifier.uuid } : { order_id: identifier.orderId }
		)

	const verifyWebhookSignature = (payload: Record<string, unknown>): boolean => {
		const { sign, ...rest } = payload

		if (typeof sign !== 'string') {
			return false
		}

		const expected = createHash('md5')
			.update(Buffer.from(phpCompatibleJson(rest)).toString('base64') + apiKey)
			.digest('hex')

		const received = Buffer.from(sign)
		const computed = Buffer.from(expected)

		return received.length === computed.length && timingSafeEqual(received, computed)
	}

	return { createInvoice, getPaymentInfo, verifyWebhookSignature }
}

export type HeleketClient = ReturnType<typeof createHeleketClient>
