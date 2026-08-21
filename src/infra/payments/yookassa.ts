import { env } from '@/config/env'
import { createHttpClient } from '@/infra/http/client'

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
}

const CURRENCY = 'RUB'

const credentials = Buffer.from(
	`${env.YOOKASSA_SHOP_ID}:${env.YOOKASSA_SECRET_KEY}`,
).toString('base64')

const client = createHttpClient({
	baseURL: 'https://api.yookassa.ru/v3',
	timeout: 7000,
	headers: {
		Authorization: `Basic ${credentials}`,
		'Content-Type': 'application/json',
	},
	retry: { retries: 3, minTimeout: 400, factor: 2 },
	beforeRequest: (request) => {
		if (
			request.method === 'POST' &&
			!request.headers.has('Idempotence-Key')
		) {
			request.headers.set('Idempotence-Key', crypto.randomUUID())
		}

		return request
	},
})

export const createPayment = (input: CreatePaymentInput) =>
	client<Payment>('/payments', {
		method: 'POST',
		body: JSON.stringify({
			amount: { value: input.amount.toFixed(2), currency: CURRENCY },
			capture: true,
			confirmation: { type: 'redirect', return_url: input.returnUrl },
			description: input.description,
			metadata: input.metadata,
		}),
	})

export const getPayment = (paymentId: string) =>
	client<Payment>(`/payments/${paymentId}`)
