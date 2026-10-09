import { timingSafeEqual } from 'node:crypto'

import { createHttpClient, HttpError, type HttpLogger } from '@teacoder/http'

const STARS_CURRENCY = 'XTR'
const SUBSCRIPTION_PERIOD_SECONDS = 30 * 24 * 60 * 60

export const SECRET_TOKEN_HEADER = 'x-telegram-bot-api-secret-token'

export interface TelegramStarsClientOptions {
	botToken: string

	webhookSecret: string

	timeout?: number
	logger?: HttpLogger
}

export interface CreateInvoiceLinkInput {
	title: string
	description: string
	payload: string
	amount: number
	subscription?: boolean
}

export interface PreCheckoutQuery {
	id: string
	from: { id: number; username?: string }
	currency: string
	total_amount: number
	invoice_payload: string
}

export interface SuccessfulPayment {
	currency: string
	total_amount: number
	invoice_payload: string
	telegram_payment_charge_id: string
	provider_payment_charge_id: string
	subscription_expiration_date?: number
	is_recurring?: true
	is_first_recurring?: true
}

interface Envelope<T> {
	ok: boolean
	result?: T
	error_code?: number
	description?: string
}

export class TelegramApiError extends Error {
	constructor(
		readonly method: string,
		readonly errorCode: number,
		description: string
	) {
		super(`Telegram ${method} failed: ${description} (${errorCode})`)
		this.name = 'TelegramApiError'
	}
}

export const createTelegramStarsClient = ({
	botToken,
	webhookSecret,
	timeout = 7000,
	logger
}: TelegramStarsClientOptions) => {
	const http = createHttpClient({
		baseURL: `https://api.telegram.org/bot${botToken}`,
		timeout,
		logger,
		headers: { 'Content-Type': 'application/json' },
		retry: { retries: 2, minTimeout: 400, factor: 2 }
	})

	const call = async <T>(method: string, body?: Record<string, unknown>) => {
		try {
			const envelope = await http<Envelope<T>>(`/${method}`, {
				method: 'POST',
				body: body ? JSON.stringify(body) : undefined
			})

			if (!envelope.ok || envelope.result === undefined) {
				throw new TelegramApiError(
					method,
					envelope.error_code ?? 0,
					envelope.description ?? 'Unknown error'
				)
			}

			return envelope.result
		} catch (err) {
			if (!(err instanceof HttpError)) {
				throw err
			}

			const errorBody = (err.body ?? {}) as Envelope<never>

			throw new TelegramApiError(
				method,
				errorBody.error_code ?? err.status,
				errorBody.description ?? 'Unknown error'
			)
		}
	}

	const createInvoiceLink = (input: CreateInvoiceLinkInput) =>
		call<string>('createInvoiceLink', {
			title: input.title,
			description: input.description,
			payload: input.payload,
			provider_token: '',
			currency: STARS_CURRENCY,
			prices: [{ label: input.title, amount: input.amount }],
			...(input.subscription ? { subscription_period: SUBSCRIPTION_PERIOD_SECONDS } : {})
		})

	const answerPreCheckoutQuery = (queryId: string, ok: boolean, errorMessage?: string) =>
		call<true>('answerPreCheckoutQuery', {
			pre_checkout_query_id: queryId,
			ok,
			...(errorMessage ? { error_message: errorMessage } : {})
		})

	const refundStarPayment = (telegramUserId: number, chargeId: string) =>
		call<true>('refundStarPayment', {
			user_id: telegramUserId,
			telegram_payment_charge_id: chargeId
		})

	const setWebhookUrl = (url: string) =>
		call<true>('setWebhook', {
			url,
			secret_token: webhookSecret,
			allowed_updates: ['pre_checkout_query', 'message']
		})

	const verifyWebhookSecret = (received: string | undefined): boolean => {
		if (!received) {
			return false
		}

		const expected = Buffer.from(webhookSecret)
		const actual = Buffer.from(received)

		if (actual.length !== expected.length) {
			return false
		}

		return timingSafeEqual(actual, expected)
	}

	return {
		createInvoiceLink,
		answerPreCheckoutQuery,
		refundStarPayment,
		setWebhookUrl,
		verifyWebhookSecret
	}
}

export type TelegramStarsClient = ReturnType<typeof createTelegramStarsClient>
