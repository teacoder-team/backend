import { createHash, timingSafeEqual } from 'node:crypto'

const PAYMENT_URL = 'https://auth.robokassa.ru/Merchant/Index.aspx'
const RECURRING_URL = 'https://auth.robokassa.ru/Merchant/Recurring'
const OPERATION_STATE_URL = 'https://auth.robokassa.ru/Merchant/WebService/Service.asmx/OpStateExt'

const OPERATION_NOT_FOUND = 3

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
	paymentMethods?: string[]
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
	customParams?: Record<string, string>
}

export type OperationState =
	| { found: false }
	| { found: true; stateCode: number; amount: string | null; currency: string | null }

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

const xmlCode = (xml: string, element: string): number | null => {
	const match = new RegExp(`<${element}>\\s*<Code>(\\d+)</Code>`).exec(xml)

	return match ? Number(match[1]) : null
}

const read = (data: Params, key: string) =>
	data instanceof URLSearchParams ? data.get(key) : data[key]

const validateInvoiceId = (invoiceId: number) => {
	if (!Number.isSafeInteger(invoiceId) || invoiceId <= 0) {
		throw new RobokassaError('', 'Invoice ID must be a positive safe integer')
	}
}

const formatAmount = (amount: number) => {
	const minorUnits = Math.round(amount * 100)

	if (
		!Number.isSafeInteger(minorUnits) ||
		minorUnits <= 0 ||
		Math.abs(amount * 100 - minorUnits) > 0.000001
	) {
		throw new RobokassaError('', 'Amount must be positive with at most two decimal places')
	}

	return (minorUnits / 100).toFixed(2)
}

export const createRobokassaClient = ({
	merchantLogin,
	password1,
	password2,
	hashAlgorithm,
	testMode = true,
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
		validateInvoiceId(input.invoiceId)

		if (!merchantLogin || !password1) {
			throw new RobokassaError('', 'Robokassa payment credentials are missing')
		}

		const outSum = formatAmount(input.amount)

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
			...(input.email ? { Email: input.email } : {}),
			...(input.recurring ? { Recurring: 'true' } : {}),
			...(testMode ? { IsTest: '1' } : {})
		})

		for (const method of input.paymentMethods ?? []) {
			params.append('PaymentMethods', method)
		}

		for (const key of Object.keys(input.customParams ?? {}).sort()) {
			params.set(`Shp_${key}`, input.customParams![key])
		}

		return `${PAYMENT_URL}?${params.toString()}`
	}

	const verifyResultSignature = (body: Params) => verifySignature(body, password2)

	const verifyRedirectSignature = (query: Params) => verifySignature(query, password1)

	const chargeRecurring = async (input: ChargeRecurringInput): Promise<void> => {
		if (testMode) {
			throw new RobokassaError('', 'Recurring charges have no test mode')
		}

		validateInvoiceId(input.invoiceId)
		validateInvoiceId(input.previousInvoiceId)

		const outSum = formatAmount(input.amount)

		const signature = signRequest(
			[merchantLogin, outSum, input.invoiceId, password1],
			input.customParams
		)

		const body = new URLSearchParams({
			MerchantLogin: merchantLogin,
			InvoiceID: String(input.invoiceId),
			PreviousInvoiceID: String(input.previousInvoiceId),
			Description: input.description.slice(0, 100),
			OutSum: outSum,
			SignatureValue: signature
		})

		for (const key of Object.keys(input.customParams ?? {}).sort()) {
			body.set(`Shp_${key}`, input.customParams![key])
		}

		const response = await fetch(RECURRING_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body,
			signal: AbortSignal.timeout(timeout)
		})

		const text = await response.text()

		if (!response.ok || text.trim() !== `OK${input.invoiceId}`) {
			throw new RobokassaError(
				'',
				`Recurring charge request was rejected: ${response.status}`
			)
		}
	}

	const getOperationState = async (invoiceId: number): Promise<OperationState> => {
		if (testMode) {
			throw new RobokassaError('', 'Operation state is unavailable in test mode')
		}

		validateInvoiceId(invoiceId)

		const params = new URLSearchParams({
			MerchantLogin: merchantLogin,
			InvoiceID: String(invoiceId),
			Signature: signRequest([merchantLogin, invoiceId, password2])
		})

		const response = await fetch(`${OPERATION_STATE_URL}?${params.toString()}`, {
			signal: AbortSignal.timeout(timeout)
		})

		const text = await response.text()
		const resultCode = xmlCode(text, 'Result')

		if (!response.ok || resultCode === null) {
			throw new RobokassaError('', `Operation state request failed: ${response.status}`)
		}

		if (resultCode === OPERATION_NOT_FOUND) {
			return { found: false }
		}

		const stateCode = xmlCode(text, 'State')

		if (resultCode !== 0 || stateCode === null) {
			throw new RobokassaError('', `Operation state request was rejected: ${resultCode}`)
		}

		return {
			found: true,
			stateCode,
			amount: /<OutSum>\s*([0-9]+(?:\.[0-9]+)?)\s*<\/OutSum>/.exec(text)?.[1] ?? null,
			currency: /<OutCurrLabel>\s*([A-Z]+)\s*<\/OutCurrLabel>/.exec(text)?.[1] ?? null
		}
	}

	return {
		createInvoiceUrl,
		verifyResultSignature,
		verifyRedirectSignature,
		chargeRecurring,
		getOperationState
	}
}

export type RobokassaClient = ReturnType<typeof createRobokassaClient>
