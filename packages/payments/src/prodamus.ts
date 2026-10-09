import { createHmac, timingSafeEqual } from 'node:crypto'

export type Currency = 'rub' | 'usd' | 'eur' | 'kzt'

export const WORLD_PAYMENT_METHOD_GROUPS = ['world_payments'] as const

export const INTERNATIONAL_PAYMENT_METHODS = [
	'ACkz',
	'ACf',
	'ACUSDGTL',
	'ACEURGTL',
	'ACBYNGTL',
	'ACUSDKB',
	'ACEURKB',
	'monetaworld',
	'yottapay'
] as const

export const YANDEX_SPLIT_PAYMENT_METHODS = [
	'yandex_installment_0_0_2',
	'yandex_installment_0_0_4',
	'yandex_installment_0_0_6',
	'yandex_installment_0_0_12'
] as const

export interface ProdamusClientOptions {

	formUrl: string

	secretKey: string

	demoMode?: boolean
}

export interface ProdamusProduct {
	name: string
	price: number
	quantity: number
	sku?: string
}

export interface CreatePaymentInput {

	orderId: string
	products: ProdamusProduct[]

	currency?: Currency
	customerEmail?: string
	customerPhone?: string

	customerExtra?: string

	paymentMethods?: readonly string[]

	paymentMethodGroups?: readonly string[]

	successUrl?: string

	returnUrl?: string

	callbackUrl?: string

	paymentsLimit?: number
}

export type PaymentStatus = 'success' | 'pending' | 'order_canceled' | 'order_denied'

export interface Notification {
	date: string

	order_id: string

	order_num: string
	domain: string
	sum: string
	currency?: string
	customer_phone?: string
	customer_email?: string
	customer_extra?: string
	payment_type?: string
	commission?: string
	commission_sum?: string
	attempt?: string
	sys?: string
	products?: { name: string; price: string; quantity: string; sum?: string }[]
	payment_status: PaymentStatus
	payment_status_description?: string
	payment_init?: string
}

type Scalar = string | number | boolean
type Value = Scalar | null | undefined | Value[] | { [key: string]: Value }

const isRecord = (value: Value): value is { [key: string]: Value } =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

const canonical = (value: Value): unknown => {
	if (Array.isArray(value)) {
		return value.map(canonical)
	}

	if (isRecord(value)) {
		const entries = Object.entries(value).filter(([, item]) => item !== undefined)

		entries.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))

		return Object.fromEntries(entries.map(([key, item]) => [key, canonical(item)]))
	}

	return value === null || value === undefined ? '' : String(value)
}

const sign = (payload: Record<string, Value>, secretKey: string) => {
	const { signature, ...rest } = payload

	void signature

	const json = JSON.stringify(canonical(rest)).replace(/\//g, '\\/')

	return createHmac('sha256', secretKey).update(json).digest('hex')
}

const assign = (target: Record<string, Value>, path: string[], value: string) => {
	const [head, ...rest] = path

	if (head === undefined) {
		return
	}

	if (rest.length === 0) {
		target[head] = value

		return
	}

	const existing = target[head]
	const nested = isRecord(existing) ? existing : {}

	target[head] = nested

	assign(nested, rest, value)
}

const NUMERIC = /^\d+$/

const toLists = (value: Value): Value => {
	if (!isRecord(value)) {
		return value
	}

	const keys = Object.keys(value)
	const mapped = Object.fromEntries(keys.map((key) => [key, toLists(value[key])]))

	if (keys.length > 0 && keys.every((key) => NUMERIC.test(key))) {
		const indices = keys.map(Number).sort((left, right) => left - right)

		if (indices.every((index, position) => index === position)) {
			return indices.map((index) => mapped[String(index)] as Value)
		}
	}

	return mapped
}

const KEY_PATH = /[^[\]]+/g

export const parseNotification = (fields: Record<string, unknown>) => {
	const nested: Record<string, Value> = {}

	for (const [key, value] of Object.entries(fields)) {
		if (value === null || value === undefined || typeof value === 'object') {
			continue
		}

		assign(nested, key.match(KEY_PATH) ?? [key], String(value))
	}

	return toLists(nested) as Record<string, Value>
}

export const createProdamusClient = ({
	formUrl,
	secretKey,
	demoMode = false
}: ProdamusClientOptions) => {
	const base = formUrl.replace(/\/+$/, '')

	const toFields = (input: CreatePaymentInput): Record<string, Value> => ({
		do: 'pay',
		sys: 'default',
		order_id: input.orderId,
		currency: input.currency ?? 'rub',
		products: input.products.map((product) => ({
			name: product.name,
			price: product.price,
			quantity: product.quantity,
			...(product.sku ? { sku: product.sku } : {})
		})),
		payments_limit: input.paymentsLimit ?? 1,
		...(input.customerEmail ? { customer_email: input.customerEmail } : {}),
		...(input.customerPhone ? { customer_phone: input.customerPhone } : {}),
		...(input.customerExtra ? { customer_extra: input.customerExtra } : {}),
		...(input.paymentMethods?.length
			? { available_payment_methods: input.paymentMethods.join('|') }
			: {}),
		...(input.paymentMethodGroups?.length
			? { available_payment_method_groups: input.paymentMethodGroups.join('|') }
			: {}),
		...(input.successUrl ? { urlSuccess: input.successUrl } : {}),
		...(input.returnUrl ? { urlReturn: input.returnUrl } : {}),
		...(input.callbackUrl ? { urlNotification: input.callbackUrl } : {}),
		...(demoMode ? { demo_mode: 1 } : {})
	})

	const flatten = (value: Value, prefix = ''): [string, string][] => {
		if (Array.isArray(value)) {
			return value.flatMap((item, index) => flatten(item, `${prefix}[${index}]`))
		}

		if (isRecord(value)) {
			return Object.entries(value).flatMap(([key, item]) =>
				flatten(item, prefix ? `${prefix}[${key}]` : key)
			)
		}

		if (value === null || value === undefined) {
			return []
		}

		return [[prefix, String(value)]]
	}

	const createPaymentUrl = (input: CreatePaymentInput) => {
		const fields = toFields(input)
		const params = new URLSearchParams(
			flatten({ ...fields, signature: sign(fields, secretKey) })
		)

		return `${base}/?${params.toString()}`
	}

	const verifyWebhookSignature = (payload: Record<string, Value>, signature: string | null) => {
		if (!signature) {
			return false
		}

		const received = Buffer.from(signature)
		const computed = Buffer.from(sign(payload, secretKey))

		return received.length === computed.length && timingSafeEqual(received, computed)
	}

	return { createPaymentUrl, verifyWebhookSignature }
}

export type ProdamusClient = ReturnType<typeof createProdamusClient>
