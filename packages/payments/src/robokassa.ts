import { createHash, timingSafeEqual } from 'node:crypto'

const PAYMENT_URL = 'https://auth.robokassa.ru/Merchant/Payment/Index'
const RECURRING_URL = 'https://auth.robokassa.ru/Merchant/Recurring'

const CARD_ONLY = 'BankCard'

export type RobokassaHashAlgorithm = 'md5' | 'ripemd160' | 'sha1' | 'sha256' | 'sha384' | 'sha512'

export interface RobokassaClientOptions {
	merchantLogin: string

	password1: string

	password2: string

	hashAlgorithm: RobokassaHashAlgorithm

	testMode?: boolean

	timeout?: number
}

export interface CreateInvoiceInput {
	invoiceId: number
	amount: number
	description: string
	email?: string
	recurring?: boolean
	customParams?: Record<string, string>
}

export interface ResultNotification {
	outSum: string
	invId: number
	signatureValue: string
	customParams: Record<string, string>
}

export interface ChargeRecurringInput {
	invoiceId: number
	previousInvoiceId: number
	amount: number
	description: string
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

type Params = URLSearchParams | Record<string, string>

const shpSegments = (customParams: Record<string, string> | undefined): string[] =>
	Object.keys(customParams ?? {})
		.sort()
		.map((key) => `Shp_${key}=${customParams![key]}`)

const signaturesMatch = (received: string, expected: string): boolean => {
	const a = Buffer.from(received.toLowerCase())
	const b = Buffer.from(expected.toLowerCase())

	return a.length === b.length && timingSafeEqual(a, b)
}

const extractCustomParams = (data: Params): Record<string, string> => {
	const entries =
		data instanceof URLSearchParams ? Array.from(data.entries()) : Object.entries(data)

	return Object.fromEntries(
		entries
			.filter(([key]) => key.toLowerCase().startsWith('shp_'))
			.map(([key, value]) => [key.slice(4), value])
	)
}

const read = (data: Params, key: string) =>
	data instanceof URLSearchParams ? data.get(key) : data[key]

export const createRobokassaClient = ({
	merchantLogin,
	password1,
	password2,
	hashAlgorithm,
	testMode = false,
	timeout = 15_000
}: RobokassaClientOptions) => {
	const signRequest = (parts: (string | number)[], customParams?: Record<string, string>) =>
		createHash(hashAlgorithm)
			.update([...parts, ...shpSegments(customParams)].join(':'))
			.digest('hex')

	const verifySignature = (data: Params, password: string): boolean => {
		const outSum = read(data, 'OutSum')
		const invId = read(data, 'InvId')
		const signature = read(data, 'SignatureValue')

		if (!outSum || !invId || !signature) {
			return false
		}

		const expected = signRequest([outSum, invId, password], extractCustomParams(data))

		return signaturesMatch(signature, expected)
	}

	const createInvoiceUrl = (input: CreateInvoiceInput): string => {
		const outSum = input.amount.toFixed(2)

		const signature = signRequest(
			[merchantLogin, outSum, input.invoiceId, password1],
			input.customParams
		)

		const params = new URLSearchParams({
			MerchantLogin: merchantLogin,
			OutSum: outSum,
			InvId: String(input.invoiceId),
			Description: input.description.slice(0, 100),
			SignatureValue: signature,
			Culture: 'ru',
			IncCurrLabel: CARD_ONLY,
			...(input.email ? { Email: input.email } : {}),
			...(input.recurring ? { Recurring: 'true' } : {}),
			...(testMode ? { IsTest: '1' } : {})
		})

		for (const key of Object.keys(input.customParams ?? {}).sort()) {
			params.set(`Shp_${key}`, input.customParams![key])
		}

		return `${PAYMENT_URL}?${params.toString()}`
	}

	const verifyResultSignature = (body: Params) => verifySignature(body, password2)

	const verifyRedirectSignature = (query: Params) => verifySignature(query, password1)

	const chargeRecurring = async (input: ChargeRecurringInput): Promise<void> => {
		const outSum = input.amount.toFixed(2)

		const signature = signRequest([merchantLogin, outSum, input.invoiceId, password1])

		const body = new URLSearchParams({
			MerchantLogin: merchantLogin,
			InvoiceID: String(input.invoiceId),
			PreviousInvoiceID: String(input.previousInvoiceId),
			Description: input.description.slice(0, 100),
			OutSum: outSum,
			SignatureValue: signature,
			...(testMode ? { IsTest: '1' } : {})
		})

		const response = await fetch(RECURRING_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
			signal: AbortSignal.timeout(timeout)
		})

		const text = await response.text()

		if (!response.ok || text.trim() !== `OK${input.invoiceId}`) {
			throw new RobokassaError(text, `Recurring charge request was rejected: ${text}`)
		}
	}

	return { createInvoiceUrl, verifyResultSignature, verifyRedirectSignature, chargeRecurring }
}

export type RobokassaClient = ReturnType<typeof createRobokassaClient>
