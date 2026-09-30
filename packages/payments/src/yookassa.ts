import { createHttpClient, type HttpLogger } from '@teacoder/http'

const CURRENCY = 'RUB'

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
				metadata: input.metadata
			})
		})

	const getPayment = (paymentId: string) =>
		http<Payment>(`/payments/${encodeURIComponent(paymentId)}`)

	return { createPayment, getPayment }
}

export type YookassaClient = ReturnType<typeof createYookassaClient>
