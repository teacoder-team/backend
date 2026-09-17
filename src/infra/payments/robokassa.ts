import { createHash, timingSafeEqual } from 'node:crypto'

import { env } from '~/config/env'
import { createHttpClient } from '~/infra/http/client'

const PAYMENT_URL = 'https://auth.robokassa.ru/Merchant/Payment/Index'
const RECURRING_URL = 'https://auth.robokassa.ru/Merchant/Recurring'

const CARD_ONLY = 'BankCard'

const hashHex = (value: string) =>
	createHash(env.ROBOKASSA_HASH_ALGORITHM).update(value).digest('hex')

const passwords = env.ROBOKASSA_TEST_MODE
	? { one: env.ROBOKASSA_TEST_PASSWORD_1, two: env.ROBOKASSA_TEST_PASSWORD_2 }
	: { one: env.ROBOKASSA_PASSWORD_1, two: env.ROBOKASSA_PASSWORD_2 }

const shpSegments = (customParams: Record<string, string> | undefined): string[] =>
	Object.keys(customParams ?? {})
		.sort()
		.map((key) => `Shp_${key}=${customParams![key]}`)

const signRequest = (parts: (string | number)[], customParams?: Record<string, string>) =>
	hashHex([...parts, ...shpSegments(customParams)].join(':'))

const signaturesMatch = (received: string, expected: string): boolean => {
	const a = Buffer.from(received.toLowerCase())
	const b = Buffer.from(expected.toLowerCase())

	return a.length === b.length && timingSafeEqual(a, b)
}

export interface CreateInvoiceInput {
	invoiceId: number
	amount: number
	description: string
	email?: string
	recurring?: boolean
	customParams?: Record<string, string>
}

export const createInvoiceUrl = (input: CreateInvoiceInput): string => {
	const outSum = input.amount.toFixed(2)

	const signature = signRequest(
		[env.ROBOKASSA_MERCHANT_LOGIN, outSum, input.invoiceId, passwords.one],
		input.customParams
	)

	const params = new URLSearchParams({
		MerchantLogin: env.ROBOKASSA_MERCHANT_LOGIN,
		OutSum: outSum,
		InvId: String(input.invoiceId),
		Description: input.description.slice(0, 100),
		SignatureValue: signature,
		Culture: 'ru',
		IncCurrLabel: CARD_ONLY,
		...(input.email ? { Email: input.email } : {}),
		...(input.recurring ? { Recurring: 'true' } : {}),
		...(env.ROBOKASSA_TEST_MODE ? { IsTest: '1' } : {})
	})

	for (const key of Object.keys(input.customParams ?? {}).sort()) {
		params.set(`Shp_${key}`, input.customParams![key])
	}

	return `${PAYMENT_URL}?${params.toString()}`
}

export interface ResultNotification {
	outSum: string
	invId: number
	signatureValue: string
	customParams: Record<string, string>
}

const extractCustomParams = (
	data: URLSearchParams | Record<string, string>
): Record<string, string> => {
	const entries =
		data instanceof URLSearchParams ? Array.from(data.entries()) : Object.entries(data)

	return Object.fromEntries(
		entries
			.filter(([key]) => key.toLowerCase().startsWith('shp_'))
			.map(([key, value]) => [key.slice(4), value])
	)
}

export const verifyResultSignature = (body: URLSearchParams | Record<string, string>): boolean => {
	const get = (key: string) => (body instanceof URLSearchParams ? body.get(key) : body[key])

	const outSum = get('OutSum')
	const invId = get('InvId')
	const signature = get('SignatureValue')

	if (!outSum || !invId || !signature) return false

	const expected = signRequest([outSum, invId, passwords.two], extractCustomParams(body))

	return signaturesMatch(signature, expected)
}

export const verifyRedirectSignature = (
	query: URLSearchParams | Record<string, string>
): boolean => {
	const get = (key: string) => (query instanceof URLSearchParams ? query.get(key) : query[key])

	const outSum = get('OutSum')
	const invId = get('InvId')
	const signature = get('SignatureValue')

	if (!outSum || !invId || !signature) return false

	const expected = signRequest([outSum, invId, passwords.one], extractCustomParams(query))

	return signaturesMatch(signature, expected)
}

export class RobokassaError extends Error {
	constructor(
		readonly rawResponse: string,
		message: string
	) {
		super(message)
		this.name = 'RobokassaError'
	}
}

export interface ChargeRecurringInput {
	invoiceId: number
	previousInvoiceId: number
	amount: number
	description: string
}

export const chargeRecurring = async (input: ChargeRecurringInput): Promise<void> => {
	const outSum = input.amount.toFixed(2)

	// PreviousInvoiceID deliberately does not take part in the signature —
	// confirmed explicitly in Robokassa's own docs for this endpoint.
	const signature = signRequest([
		env.ROBOKASSA_MERCHANT_LOGIN,
		outSum,
		input.invoiceId,
		passwords.one
	])

	const body = new URLSearchParams({
		MerchantLogin: env.ROBOKASSA_MERCHANT_LOGIN,
		InvoiceID: String(input.invoiceId),
		PreviousInvoiceID: String(input.previousInvoiceId),
		Description: input.description.slice(0, 100),
		OutSum: outSum,
		SignatureValue: signature,
		...(env.ROBOKASSA_TEST_MODE ? { IsTest: '1' } : {})
	})

	const response = await fetch(RECURRING_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body,
		signal: AbortSignal.timeout(15_000)
	})

	const text = await response.text()

	if (!response.ok || text.trim() !== `OK${input.invoiceId}`) {
		throw new RobokassaError(text, `Recurring charge request was rejected: ${text}`)
	}
}
