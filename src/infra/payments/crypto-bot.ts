import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

import { env } from '@/config/env'
import { createHttpClient } from '@/infra/http/client'

const MAINNET_URL = 'https://pay.crypt.bot/api'
const TESTNET_URL = 'https://testnet-pay.cr.bot/api'

const DEFAULT_EXPIRES_IN = 60 * 60

export const SIGNATURE_HEADER = 'crypto-pay-api-signature'

export type CryptoAsset =
	| 'USDT'
	| 'USDC'
	| 'TON'
	| 'BTC'
	| 'ETH'
	| 'LTC'
	| 'BNB'
	| 'TRX'

export type FiatCurrency = 'RUB' | 'USD' | 'EUR'

export type InvoiceStatus = 'active' | 'paid' | 'expired'

export interface Invoice {
	invoice_id: number
	hash: string
	currency_type: 'crypto' | 'fiat'
	asset?: string
	amount: string
	status: InvoiceStatus
	bot_invoice_url: string
	mini_app_invoice_url?: string
	web_app_invoice_url?: string
	description?: string
	payload?: string
	created_at: string
	paid_at?: string
	expiration_date?: string
}

interface Envelope<T> {
	ok: boolean
	result?: T
	error?: { code: number; name: string }
}

export class CryptoBotError extends Error {
	constructor(
		readonly method: string,
		readonly apiCode: number,
		readonly apiName: string,
	) {
		super(`Crypto Pay ${method} failed: ${apiName} (${apiCode})`)
		this.name = 'CryptoBotError'
	}
}

const client = createHttpClient({
	baseURL: env.CRYPTO_BOT_TESTNET ? TESTNET_URL : MAINNET_URL,
	timeout: 7000,
	headers: {
		'Crypto-Pay-API-Token': env.CRYPTO_BOT_TOKEN,
	},
	retry: { retries: 3, minTimeout: 400, factor: 2 },
})

type Param = string | number | boolean | undefined

const query = (params: Record<string, Param>) => {
	const search = new URLSearchParams()

	for (const [name, value] of Object.entries(params)) {
		if (value !== undefined) search.set(name, String(value))
	}

	const serialized = search.toString()

	return serialized ? `?${serialized}` : ''
}

const call = async <T>(method: string, params: Record<string, Param> = {}) => {
	const envelope = await client<Envelope<T>>(`/${method}${query(params)}`)

	if (!envelope.ok || envelope.result === undefined) {
		const { code = 0, name = 'UNKNOWN_ERROR' } = envelope.error ?? {}

		throw new CryptoBotError(method, code, name)
	}

	return envelope.result
}

export interface CreateInvoiceInput {
	/** Price the invoice in crypto. Mutually exclusive with `fiat`. */
	asset?: CryptoAsset
	/** Price the invoice in fiat; the payer still settles in crypto. */
	fiat?: FiatCurrency
	amount: number
	description?: string
	payload?: string
	returnUrl?: string
	expiresIn?: number
}

export const createInvoice = (input: CreateInvoiceInput) =>
	call<Invoice>('createInvoice', {
		currency_type: input.fiat ? 'fiat' : 'crypto',
		asset: input.fiat ? undefined : input.asset,
		fiat: input.fiat,
		amount: input.amount.toString(),
		description: input.description,
		payload: input.payload,
		expires_in: input.expiresIn ?? DEFAULT_EXPIRES_IN,
		paid_btn_name: input.returnUrl ? 'viewItem' : undefined,
		paid_btn_url: input.returnUrl,
	})

export const getInvoice = async (invoiceId: number) => {
	const { items } = await call<{ items: Invoice[] }>('getInvoices', {
		invoice_ids: invoiceId,
		count: 1,
	})

	return items[0] ?? null
}

export const deleteInvoice = (invoiceId: number) =>
	call<boolean>('deleteInvoice', { invoice_id: invoiceId })

export const verifyWebhookSignature = (
	rawBody: string,
	signature: string | undefined,
): boolean => {
	if (!signature) return false

	const secret = createHash('sha256').update(env.CRYPTO_BOT_TOKEN).digest()
	const expected = createHmac('sha256', secret).update(rawBody).digest('hex')

	const received = Buffer.from(signature, 'hex')
	const computed = Buffer.from(expected, 'hex')

	if (received.length !== computed.length) return false

	return timingSafeEqual(received, computed)
}

export interface InvoicePaidUpdate {
	update_id: number
	update_type: 'invoice_paid'
	request_date: string
	payload: Invoice
}
