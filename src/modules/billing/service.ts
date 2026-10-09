import {
	WORLD_PAYMENT_METHOD_GROUPS,
	YANDEX_SPLIT_PAYMENT_METHODS
} from '@teacoder/payments/prodamus'
import type { PaymentMethodType } from '@teacoder/payments/yookassa'

import type { PaymentIntent } from '@prisma/generated/client'
import { PaymentMethod, PaymentProvider, Prisma } from '@prisma/generated/client'

import { env } from '~/config/env'
import {
	AppError,
	BadRequestError,
	ConflictError,
	InternalError,
	NotFoundError
} from '~/lib/errors'
import {
	cryptoBot,
	heleket,
	prodamus,
	robokassa,
	telegramStars,
	yookassa
} from '~/lib/integrations/payments'
import { LockTakenError, withLock } from '~/lib/lock'
import { extendLogContext, logger } from '~/lib/logger'
import { getUserEmail } from '~/modules/auth/service'
import { findCoursePurchase, findPurchasableCourse } from '~/modules/course/repository'
import { PREMIUM_PLAN, premiumAmount } from '~/modules/subscription/plan'
import {
	cancelSubscription as cancelSubscriptionRow,
	findSubscription,
	setAutoBilling
} from '~/modules/subscription/repository'
import { isLiveSubscription } from '~/modules/subscription/term'

import {
	CHECKOUT_TTL_SECONDS,
	type CheckoutRequest,
	findIdempotentReplay,
	findReusableCheckout
} from './checkout'
import type { CreatePaymentInput, UpdateSubscriptionInput } from './model'
import {
	attachProviderPayment,
	createPendingPayment,
	findChargeableMethod,
	markPaymentFailed
} from './repository'

const CURRENCY = 'RUB'

const RETURN_URL = env.APP_URL

type MethodCategory = 'FIAT' | 'CRYPTO' | 'STARS'

interface MethodDefinition {
	category: MethodCategory
	name: string
	description: string
	providers: PaymentProvider[]
}

/** Methods left out are not on sale: `resolveProvider` reports them as unavailable. */
const METHODS: Partial<Record<PaymentMethod, MethodDefinition>> = {
	[PaymentMethod.BANK_CARD]: {
		category: 'FIAT',
		name: 'Банковская карта',
		description: 'Оплата картой российских банков',
		providers: [PaymentProvider.YOOKASSA]
	},
	[PaymentMethod.SBP]: {
		category: 'FIAT',
		name: 'СБП',
		description: 'Оплата через Систему быстрых платежей',
		providers: [PaymentProvider.YOOKASSA]
	},
	// [PaymentMethod.T_PAY]: {
	// 	category: 'FIAT',
	// 	name: 'T-Pay',
	// 	description: 'Оплата через приложение Т-Банка',
	// 	providers: [PaymentProvider.YOOKASSA]
	// },
	// [PaymentMethod.SBER_PAY]: {
	// 	category: 'FIAT',
	// 	name: 'SberPay',
	// 	description: 'Оплата через приложение СберБанк Онлайн',
	// 	providers: [PaymentProvider.YOOKASSA]
	// },
	// [PaymentMethod.YOOMONEY]: {
	// 	category: 'FIAT',
	// 	name: 'ЮMoney',
	// 	description: 'Оплата с кошелька ЮMoney',
	// 	providers: [PaymentProvider.YOOKASSA]
	// },
	[PaymentMethod.INTERNATIONAL_CARD]: {
		category: 'FIAT',
		name: 'Иностранные карты',
		description: 'Оплата картами банков мира и другими международными способами',
		providers: [PaymentProvider.PRODAMUS, PaymentProvider.ROBOKASSA]
	},
	// [PaymentMethod.YANDEX_SPLIT]: {
	// 	category: 'FIAT',
	// 	name: 'Яндекс Сплит',
	// 	description: 'Оплата частями через Яндекс Сплит',
	// 	providers: [PaymentProvider.PRODAMUS]
	// },
	[PaymentMethod.HELEKET]: {
		category: 'CRYPTO',
		name: 'Криптовалюта',
		description: 'USDT, GRAM, BTC и другие',
		providers: [PaymentProvider.HELEKET]
	}
	// [PaymentMethod.HELEKET]: {
	// 	category: 'CRYPTO',
	// 	name: 'Heleket',
	// 	description: 'Оплата в криптовалюте через Heleket - USDT, GRAM, BTC и другие',
	// 	providers: [PaymentProvider.HELEKET]
	// },
	// [PaymentMethod.TELEGRAM_STARS]: {
	// 	category: 'STARS',
	// 	name: 'Telegram Stars',
	// 	description: 'Оплата звёздами Telegram, без банковской карты',
	// 	providers: [PaymentProvider.TELEGRAM]
	// }
}

const YOOKASSA_PAYMENT_METHOD_TYPES: Partial<Record<PaymentMethod, PaymentMethodType>> = {
	[PaymentMethod.BANK_CARD]: 'bank_card',
	[PaymentMethod.SBP]: 'sbp',
	[PaymentMethod.T_PAY]: 'tinkoff_bank',
	[PaymentMethod.YOOMONEY]: 'yoo_money',
	[PaymentMethod.SBER_PAY]: 'sberbank'
}

export const paymentMethodName = (method: PaymentMethod) => METHODS[method]?.name ?? method

export const PAYMENT_PROVIDER_NAMES: Record<PaymentProvider, string> = {
	[PaymentProvider.YOOKASSA]: 'ЮKassa',
	[PaymentProvider.ROBOKASSA]: 'Robokassa',
	[PaymentProvider.PRODAMUS]: 'Prodamus',
	[PaymentProvider.HELEKET]: 'Heleket',
	[PaymentProvider.CRYPTO_BOT]: 'Crypto Bot',
	[PaymentProvider.CLOUDPAYMENTS]: 'CloudPayments',
	[PaymentProvider.TELEGRAM]: 'Telegram Stars'
}

const CATEGORY_ORDER = ['FIAT', 'CRYPTO', 'STARS'] as const

const CATEGORY_NAMES: Record<MethodCategory, string> = {
	FIAT: 'Банковские способы',
	CRYPTO: 'Криптовалюта',
	STARS: 'Telegram Stars'
}

const IMPLEMENTED_PROVIDERS = new Set<PaymentProvider>([
	PaymentProvider.YOOKASSA,
	PaymentProvider.ROBOKASSA,
	PaymentProvider.PRODAMUS,
	PaymentProvider.CRYPTO_BOT,
	PaymentProvider.HELEKET,
	PaymentProvider.TELEGRAM
])

const definitions = () => Object.entries(METHODS) as [PaymentMethod, MethodDefinition][]

const resolveProvider = (method: PaymentMethod): PaymentProvider | null =>
	METHODS[method]?.providers.find((provider) => IMPLEMENTED_PROVIDERS.has(provider)) ?? null

export const listPaymentMethods = () => ({
	categories: CATEGORY_ORDER.map((category) => ({
		id: category,
		name: CATEGORY_NAMES[category],
		methods: definitions()
			.filter(([, definition]) => definition.category === category)
			.map(([id, definition]) => ({
				id,
				name: definition.name,
				description: definition.description,
				isAvailable: resolveProvider(id) !== null
			}))
	}))
})

export const listAvailablePaymentMethods = () =>
	definitions()
		.filter(([id]) => resolveProvider(id) !== null)
		.map(([id, definition]) => ({
			id,
			name: definition.name,
			description: definition.description
		}))

interface Product {
	kind: 'subscription' | 'course'
	amount: number
	description: string
	courseId?: string
	/** Paid period, subscription only. */
	months?: number
	stars?: number
}

/** The premium price depends on the method - only courses are priced in the database. */
const resolveProduct = async (
	courseId: string | undefined,
	method: PaymentMethod
): Promise<Product> => {
	if (!courseId) {
		return {
			kind: 'subscription',
			amount: premiumAmount(method),
			description: PREMIUM_PLAN.description,
			months: PREMIUM_PLAN.months,
			stars: PREMIUM_PLAN.stars
		}
	}

	const course = await findPurchasableCourse(courseId)

	if (!course) {
		throw new NotFoundError('Course not found or not for sale')
	}

	return {
		kind: 'course',
		amount: Number(course.price),
		description: `Покупка курса «${course.title}»`,
		courseId: course.id
	}
}

const startAtProvider = async (payment: PaymentIntent, product: Product, email: string | null) => {
	switch (payment.provider) {
		case PaymentProvider.YOOKASSA: {
			const created = await yookassa.createPayment({
				amount: payment.amount,
				description: product.description,
				returnUrl: RETURN_URL,
				metadata: {
					paymentId: payment.id
				},
				paymentMethodType: YOOKASSA_PAYMENT_METHOD_TYPES[payment.method],
				savePaymentMethod: true
			})

			const url = created.confirmation?.confirmation_url

			if (!url) {
				throw new InternalError('Provider returned no confirmation URL')
			}

			return { url, pspIntentId: created.id, raw: created }
		}

		case PaymentProvider.ROBOKASSA: {
			const recurring = product.kind === 'subscription'

			const url = robokassa.createInvoiceUrl({
				invoiceId: payment.invoiceNumber,
				amount: payment.amount,
				description: product.description,
				email: email ?? undefined,
				recurring,
				customParams: { paymentId: payment.id }
			})

			return { url, pspIntentId: String(payment.invoiceNumber), raw: undefined }
		}

		case PaymentProvider.PRODAMUS: {
			const url = prodamus.createPaymentUrl({
				orderId: payment.id,
				products: [{ name: product.description, price: payment.amount, quantity: 1 }],
				customerEmail: email ?? undefined,
				paymentMethods:
					payment.method === PaymentMethod.YANDEX_SPLIT
						? YANDEX_SPLIT_PAYMENT_METHODS
						: undefined,
				paymentMethodGroups:
					payment.method === PaymentMethod.INTERNATIONAL_CARD
						? WORLD_PAYMENT_METHOD_GROUPS
						: undefined,
				successUrl: `${env.APP_URL}/payment/success`,
				returnUrl: RETURN_URL,
				callbackUrl: `${env.GATEWAY_URL}/webhook/prodamus`
			})

			return { url, pspIntentId: null, raw: undefined }
		}

		case PaymentProvider.CRYPTO_BOT: {
			const invoice = await cryptoBot.createInvoice({
				fiat: CURRENCY,
				amount: payment.amount,
				description: product.description,
				payload: payment.id,
				returnUrl: RETURN_URL,
				expiresIn: CHECKOUT_TTL_SECONDS
			})

			return {
				url: invoice.bot_invoice_url,
				pspIntentId: String(invoice.invoice_id),
				raw: invoice
			}
		}

		case PaymentProvider.HELEKET: {
			const invoice = await heleket.createInvoice({
				orderId: payment.id,
				amount: payment.amount,
				returnUrl: RETURN_URL,
				callbackUrl: `${env.GATEWAY_URL}/webhook/heleket`,
				lifetime: CHECKOUT_TTL_SECONDS,
				additionalData: product.description
			})

			return { url: invoice.url, pspIntentId: invoice.uuid, raw: invoice }
		}

		case PaymentProvider.TELEGRAM: {
			if (!product.stars) {
				throw new BadRequestError(
					'Telegram Stars pricing is not set up for this purchase yet'
				)
			}

			const url = await telegramStars.createInvoiceLink({
				title: 'TeaCoder',
				description: product.description,
				payload: payment.id,
				amount: product.stars
			})

			return { url, pspIntentId: null, raw: undefined }
		}

		default:
			throw new InternalError(`No integration wired for provider ${payment.provider}`)
	}
}

interface ReplayableIntent {
	id: string
	status: PaymentIntent['status']
	provider: PaymentProvider
	method: PaymentMethod
	amount: number
	currency: string
	metadata: unknown
	pspPayload: unknown
}

const toResponse = (payment: ReplayableIntent) => {
	const metadata = payment.metadata as { description?: string } | null
	const pspPayload = payment.pspPayload as { url?: string } | null

	return {
		paymentId: payment.id,
		status: payment.status,
		provider: payment.provider,
		method: payment.method,
		amount: payment.amount,
		currency: payment.currency,
		description: metadata?.description ?? '',
		url: pspPayload?.url ?? ''
	}
}

const CHECKOUT_LOCK_TTL_MS = 60_000

const checkoutLockKey = ({ userId, courseId }: CheckoutRequest) =>
	`checkout:${userId}:${courseId ?? 'subscription'}`

const isUniqueViolation = (err: unknown) =>
	err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'

const openCheckout = async (
	request: CheckoutRequest,
	provider: PaymentProvider,
	product: Product,
	fallbackEmail: string | undefined
) => {
	const { userId, idempotencyKey } = request
	const email = (await getUserEmail(userId)) ?? fallbackEmail ?? null

	const payment = await createPendingPayment({
		userId,
		amount: product.amount,
		currency: CURRENCY,
		method: request.method,
		provider,
		courseId: product.courseId,
		idempotencyKey,
		metadata: {
			email,
			description: product.description,
			...(product.courseId ? { courseId: product.courseId } : {}),
			...(product.months ? { months: product.months } : {})
		}
	}).catch((err: unknown) => {
		if (isUniqueViolation(err)) {
			throw new ConflictError('Idempotency-Key is already in use by another request')
		}

		throw err
	})

	try {
		const { url, pspIntentId, raw } = await startAtProvider(payment, product, email)

		await attachProviderPayment(payment.id, pspIntentId, {
			url,
			...(raw ? { raw } : {})
		} as unknown as Prisma.InputJsonValue)

		extendLogContext({
			event: 'payment_initialized',
			userId,
			paymentId: payment.id,
			provider,
			pspIntentId,
			product: product.kind
		})

		return {
			paymentId: payment.id,
			status: payment.status,
			provider,
			method: payment.method,
			amount: payment.amount,
			currency: payment.currency,
			description: product.description,
			url
		}
	} catch (err) {
		await markPaymentFailed(payment.id)

		extendLogContext({
			event: 'payment_initialization_failed',
			userId,
			paymentId: payment.id,
			provider,
			errorMessage: err instanceof Error ? err.message : String(err)
		})

		if (err instanceof AppError) {
			throw err
		}

		throw new BadRequestError('Payment provider is unavailable, try again later')
	}
}

const checkout = async (request: CheckoutRequest, fallbackEmail: string | undefined) => {
	const replay = await findIdempotentReplay(request)

	if (replay) {
		extendLogContext({
			event: 'payment_replayed',
			userId: request.userId,
			paymentId: replay.id
		})

		return toResponse(replay)
	}

	const provider = resolveProvider(request.method)

	if (!provider) {
		throw new BadRequestError(`Payment method ${request.method} is not available yet`)
	}

	const product = await resolveProduct(request.courseId ?? undefined, request.method)

	if (product.courseId && (await findCoursePurchase(request.userId, product.courseId))) {
		throw new ConflictError('Course already purchased')
	}

	const reusable = await findReusableCheckout(request)

	if (reusable) {
		extendLogContext({
			event: 'payment_reused',
			userId: request.userId,
			paymentId: reusable.id
		})

		return toResponse(reusable)
	}

	return openCheckout(request, provider, product, fallbackEmail)
}

export const createPayment = async (
	userId: string,
	input: CreatePaymentInput,
	idempotencyKey?: string
) => {
	const request: CheckoutRequest = {
		userId,
		method: input.method,
		courseId: input.courseId ?? null,
		idempotencyKey
	}

	try {
		return await withLock(checkoutLockKey(request), CHECKOUT_LOCK_TTL_MS, () =>
			checkout(request, input.email)
		)
	} catch (err) {
		if (err instanceof LockTakenError) {
			throw new ConflictError(
				'A payment for this product is already being created - retry in a moment'
			)
		}

		throw err
	}
}

export const cancelSubscription = async (userId: string) => {
	const cancelled = await cancelSubscriptionRow(userId)

	if (cancelled) {
		logger.info({ userId }, 'subscription_cancelled')
	}

	return { cancelled: Boolean(cancelled) }
}

type SubscriptionRow = Awaited<ReturnType<typeof findSubscription>>

const isLive = (subscription: SubscriptionRow): subscription is NonNullable<SubscriptionRow> =>
	isLiveSubscription(subscription)

type ChargeableMethod = Awaited<ReturnType<typeof findChargeableMethod>>

const toSubscriptionResponse = (subscription: SubscriptionRow, method: ChargeableMethod) => ({
	isActive: isLive(subscription),
	autoRenew: isLive(subscription) && subscription.isAutoBilling,
	startedAt: subscription?.startedAt.toISOString() ?? null,
	expiresAt: subscription?.expiresAt.toISOString() ?? null,
	paymentMethod: method && { type: method.type, title: method.title, last4: method.last4 }
})

export const getSubscription = async (userId: string) => {
	const [subscription, method] = await Promise.all([
		findSubscription(userId),
		findChargeableMethod(userId)
	])

	return toSubscriptionResponse(subscription, method)
}

export const updateSubscription = async (
	userId: string,
	{ autoRenew }: UpdateSubscriptionInput
) => {
	const [subscription, method] = await Promise.all([
		findSubscription(userId),
		findChargeableMethod(userId)
	])

	if (!isLive(subscription)) {
		if (autoRenew) {
			throw new ConflictError('No active subscription to renew')
		}

		return toSubscriptionResponse(subscription, method)
	}

	if (autoRenew && !method) {
		throw new ConflictError(
			'No saved payment method - pay for premium through YooKassa to save one'
		)
	}

	if (subscription.isAutoBilling === autoRenew) {
		return toSubscriptionResponse(subscription, method)
	}

	const updated = await setAutoBilling(userId, autoRenew)

	extendLogContext({
		event: autoRenew ? 'subscription_auto_renew_enabled' : 'subscription_auto_renew_disabled',
		userId
	})

	return toSubscriptionResponse(updated, method)
}
