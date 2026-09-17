import { createHash, timingSafeEqual } from 'node:crypto'

import { env } from '~/config/env'
import { createHttpClient, HttpError } from '~/infra/http/client'

const BASE_URL = 'https://api.heleket.com/v1'

const CURRENCY = 'RUB'

const signBody = (body: unknown): string => {
	const json = body === undefined ? '' : JSON.stringify(body)

	return createHash('md5')
		.update(Buffer.from(json).toString('base64') + env.HELEKET_PAYMENT_API_KEY)
		.digest('hex')
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

const messageFor = (envelope: ErrorEnvelope) => {
	if (envelope.message) return envelope.message

	const fieldMessages = Object.values(envelope.errors ?? {})
		.flat()
		.join('; ')

	return fieldMessages || 'Unknown error'
}

const client = createHttpClient({
	baseURL: BASE_URL,
	timeout: 7000,
	headers: {
		'Content-Type': 'application/json',
		merchant: env.HELEKET_MERCHANT_ID
	},
	retry: { retries: 2, minTimeout: 400, factor: 2 }
})

const call = async <T>(method: string, body?: Record<string, unknown>): Promise<T> => {
	try {
		const envelope = await client<Envelope<T>>(`/${method}`, {
			method: 'POST',
			headers: { sign: signBody(body) },
			...(body !== undefined ? { body: JSON.stringify(body) } : {})
		})

		if (envelope.state !== 0) {
			throw new HeleketError(0, envelope.errors ?? null, messageFor(envelope))
		}

		return envelope.result
	} catch (err) {
		if (!(err instanceof HttpError)) throw err

		const body_ = err.body as Partial<ErrorEnvelope> | null

		throw new HeleketError(
			err.status,
			body_?.errors ?? null,
			body_?.message ?? `Request failed (${err.status})`
		)
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
	/** Our own reference - must be unique across every invoice we've ever created. */
	orderId: string
	amount: number
	/** Where the "back to the shop" button on the hosted page goes. */
	returnUrl?: string
	/** Where the hosted page redirects to once payment is confirmed. */
	successUrl?: string
	/** Server-to-server notification endpoint - see verifyWebhookSignature. */
	callbackUrl?: string
	/** Seconds the invoice stays payable. Heleket accepts 300–43200. */
	lifetime?: number
	/** Ours to keep - not shown to the payer, echoed back on the webhook. */
	additionalData?: string
}

export const createInvoice = (input: CreateInvoiceInput) =>
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

export type PaymentIdentifier = { uuid: string } | { orderId: string }

export const getPaymentInfo = (identifier: PaymentIdentifier) =>
	call<Invoice>(
		'payment/info',
		'uuid' in identifier ? { uuid: identifier.uuid } : { order_id: identifier.orderId }
	)

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

const phpCompatibleJson = (value: unknown): string => JSON.stringify(value).replace(/\//g, '\\/')

export const verifyWebhookSignature = (payload: Record<string, unknown>): boolean => {
	const { sign, ...rest } = payload

	if (typeof sign !== 'string') return false

	const expected = createHash('md5')
		.update(
			Buffer.from(phpCompatibleJson(rest)).toString('base64') + env.HELEKET_PAYMENT_API_KEY
		)
		.digest('hex')

	const received = Buffer.from(sign)
	const computed = Buffer.from(expected)

	return received.length === computed.length && timingSafeEqual(received, computed)
}
