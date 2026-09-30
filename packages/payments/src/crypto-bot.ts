import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

import { createHttpClient, type HttpLogger } from '@teacoder/http'

const MAINNET_URL = 'https://pay.crypt.bot/api'
const TESTNET_URL = 'https://testnet-pay.crypt.bot'

const DEFAULT_EXPIRES_IN = 60 * 60

export const SIGNATURE_HEADER = 'crypto-pay-api-signature'

export interface CryptoBotClientOptions {
	/** Crypto Pay API token from @CryptoBot (or @CryptoTestnetBot). */
	token: string
	testnet?: boolean
	/** Milliseconds. Default 7000. */
	timeout?: number
	logger?: HttpLogger
}

export type CryptoAsset = 'USDT' | 'USDC' | 'TON' | 'BTC' | 'ETH' | 'LTC' | 'BNB' | 'TRX'

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

export interface CreateInvoiceInput {
	asset?: CryptoAsset
	fiat?: FiatCurrency
	amount: number
	description?: string
	payload?: string
	returnUrl?: string
	expiresIn?: number
}

export interface InvoicePaidUpdate {
	update_id: number
	update_type: 'invoice_paid'
	request_date: string
	payload: Invoice
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
		readonly apiName: string
	) {
		super(`Crypto Pay ${method} failed: ${apiName} (${apiCode})`)
		this.name = 'CryptoBotError'
	}
}

type Param = string | number | boolean | undefined

const query = (params: Record<string, Param>) => {
	const search = new URLSearchParams()

	for (const [name, value] of Object.entries(params)) {
		if (value !== undefined) search.set(name, String(value))
	}

	const serialized = search.toString()

	return serialized ? `?${serialized}` : ''
}

/** https://help.crypt.bot/crypto-pay-api */
export const createCryptoBotClient = ({
	token,
	testnet = false,
	timeout = 7000,
	logger
}: CryptoBotClientOptions) => {
	const http = createHttpClient({
		baseURL: testnet ? TESTNET_URL : MAINNET_URL,
		timeout,
		logger,
		headers: { 'Crypto-Pay-API-Token': token },
		retry: { retries: 3, minTimeout: 400, factor: 2 }
	})

	const call = async <T>(method: string, params: Record<string, Param> = {}) => {
		const envelope = await http<Envelope<T>>(`/${method}${query(params)}`)

		if (!envelope.ok || envelope.result === undefined) {
			const { code = 0, name = 'UNKNOWN_ERROR' } = envelope.error ?? {}

			throw new CryptoBotError(method, code, name)
		}

		return envelope.result
	}

	const createInvoice = (input: CreateInvoiceInput) =>
		call<Invoice>('createInvoice', {
			currency_type: input.fiat ? 'fiat' : 'crypto',
			asset: input.fiat ? undefined : input.asset,
			fiat: input.fiat,
			amount: input.amount.toString(),
			description: input.description,
			payload: input.payload,
			expires_in: input.expiresIn ?? DEFAULT_EXPIRES_IN,
			paid_btn_name: input.returnUrl ? 'viewItem' : undefined,
			paid_btn_url: input.returnUrl
		})

	const getInvoice = async (invoiceId: number) => {
		const { items } = await call<{ items: Invoice[] }>('getInvoices', {
			invoice_ids: invoiceId,
			count: 1
		})

		return items[0] ?? null
	}

	const deleteInvoice = (invoiceId: number) =>
		call<boolean>('deleteInvoice', { invoice_id: invoiceId })

	/** HMAC-SHA256 of the raw body, keyed with SHA256(token). Pass the SIGNATURE_HEADER value. */
	const verifyWebhookSignature = (rawBody: string, signature: string | undefined): boolean => {
		if (!signature) return false

		const secret = createHash('sha256').update(token).digest()
		const expected = createHmac('sha256', secret).update(rawBody).digest('hex')

		const received = Buffer.from(signature, 'hex')
		const computed = Buffer.from(expected, 'hex')

		if (received.length !== computed.length) return false

		return timingSafeEqual(received, computed)
	}

	return { createInvoice, getInvoice, deleteInvoice, verifyWebhookSignature }
}

export type CryptoBotClient = ReturnType<typeof createCryptoBotClient>
