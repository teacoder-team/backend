import { createHttpClient, type HttpLogger } from '@teacoder/http'

const CURRENCY = 'RUB'

export type PaymentMethodType = 'bank_card' | 'sbp' | 'tinkoff_bank' | 'yoo_money' | 'sberbank'

export interface YookassaClientOptions {
	shopId: string
	secretKey: string
	/** Milliseconds. Default 7000. */
	timeout?: number
	logger?: HttpLogger
}

export interface CreatePaymentInput {
	amount: number
	description: string
	returnUrl: string
	metadata?: Record<string, unknown>
	paymentMethodType?: PaymentMethodType
	/** Asks YooKassa to keep the card (or other method) for later charges without the user. */
	savePaymentMethod?: boolean
}

export interface RecurringPaymentInput {
	amount: number
	description: string
	/** `payment_method.id` of an earlier payment made with `savePaymentMethod`. */
	paymentMethodId: string
	metadata?: Record<string, unknown>
	/** Same key, same payment - YooKassa dedupes it for 24 hours. */
	idempotenceKey: string
}

export interface PaymentMethodDetails {
	id: string
	type: string
	/** True when the method can be charged again without the user. */
	saved: boolean
	title?: string
	card?: {
		first6?: string
		last4: string
		expiry_month?: string
		expiry_year?: string
		card_type?: string
	}
}

export interface Payment {
	id: string
	status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled'
	paid: boolean
	amount: { value: string; currency: string }
	confirmation?: { type: 'redirect'; confirmation_url: string }
	created_at: string
	description?: string
	metadata?: Record<string, unknown>
	/** Only on canceled payments - `reason` is e.g. expired_on_confirmation, insufficient_funds. */
	cancellation_details?: { party: string; reason: string }
	payment_method?: PaymentMethodDetails
}

/** https://yookassa.ru/developers/api */
export const createYookassaClient = ({
	shopId,
	secretKey,
	timeout = 7000,
	logger
}: YookassaClientOptions) => {
	const credentials = Buffer.from(`${shopId}:${secretKey}`).toString('base64')

	const http = createHttpClient({
		baseURL: 'https://api.yookassa.ru/v3',
		timeout,
		logger,
		headers: {
			Authorization: `Basic ${credentials}`,
			'Content-Type': 'application/json'
		},
		retry: { retries: 3, minTimeout: 400, factor: 2 },
		/** Retries of the same POST must reuse one key, or YooKassa opens a second payment. */
		beforeRequest: (request) => {
			if (request.method === 'POST' && !request.headers.has('Idempotence-Key')) {
				request.headers.set('Idempotence-Key', crypto.randomUUID())
			}

			return request
		}
	})

	const createPayment = (input: CreatePaymentInput) =>
		http<Payment>('/payments', {
			method: 'POST',
			body: JSON.stringify({
				amount: { value: input.amount.toFixed(2), currency: CURRENCY },
				capture: true,
				confirmation: { type: 'redirect', return_url: input.returnUrl },
				description: input.description,
				metadata: input.metadata,
				...(input.paymentMethodType
					? { payment_method_data: { type: input.paymentMethodType } }
					: {}),
				...(input.savePaymentMethod ? { save_payment_method: true } : {})
			})
		})

	/** A charge with no user present - succeeds or is declined straight away, no confirmation step. */
	const createRecurringPayment = (input: RecurringPaymentInput) =>
		http<Payment>('/payments', {
			method: 'POST',
			headers: { 'Idempotence-Key': input.idempotenceKey },
			body: JSON.stringify({
				amount: { value: input.amount.toFixed(2), currency: CURRENCY },
				capture: true,
				payment_method_id: input.paymentMethodId,
				description: input.description,
				metadata: input.metadata
			})
		})

	const getPayment = (paymentId: string) =>
		http<Payment>(`/payments/${encodeURIComponent(paymentId)}`)

	return { createPayment, createRecurringPayment, getPayment }
}

export type YookassaClient = ReturnType<typeof createYookassaClient>
