import type { PaymentIntent } from '@prisma/generated/client'
import { PaymentMethod, PaymentProvider } from '@prisma/generated/client'

import { env } from '~/config/env'
import { extendLogContext, logger } from '~/infra/logger'
import { createInvoice } from '~/infra/payments/crypto-bot'
import { createInvoice as createHeleketInvoice } from '~/infra/payments/heleket'
import { createInvoiceUrl } from '~/infra/payments/robokassa'
import { createInvoiceLink } from '~/infra/payments/telegram-stars'
import { createPayment as createYookassaPayment } from '~/infra/payments/yookassa'
import { getUserEmail } from '~/modules/auth/service'
import { findPurchasableCourse } from '~/modules/course/repository'
import { cancelSubscription as cancelSubscriptionRow } from '~/modules/subscription/repository'
import { AppError, BadRequestError, InternalError, NotFoundError } from '~/shared/errors'

import type { CreatePaymentInput } from './model'
import {
	attachProviderPayment,
	createPendingPayment,
	findPaymentByIdempotencyKey,
	markPaymentFailed
} from './repository'

const CURRENCY = 'RUB'

const PREMIUM_PLAN = {
	amount: 449,
	description: 'Оплата премиум-подписки на 1 месяц',
	stars: 150
} as const

const RETURN_URL = env.APP_PUBLIC_URL

type MethodCategory = 'FIAT' | 'CRYPTO' | 'STARS'

interface MethodDefinition {
	category: MethodCategory
	name: string
	description: string
	providers: PaymentProvider[]
}

const METHODS: Record<PaymentMethod, MethodDefinition> = {
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
	[PaymentMethod.T_PAY]: {
		category: 'FIAT',
		name: 'T-Pay',
		description: 'Оплата через приложение Т-Банка',
		providers: [PaymentProvider.YOOKASSA]
	},
	[PaymentMethod.SBER_PAY]: {
		category: 'FIAT',
		name: 'SberPay',
		description: 'Оплата через приложение СберБанк Онлайн',
		providers: [PaymentProvider.YOOKASSA]
	},
	[PaymentMethod.YOOMONEY]: {
		category: 'FIAT',
		name: 'ЮMoney',
		description: 'Оплата с кошелька ЮMoney',
		providers: [PaymentProvider.YOOKASSA]
	},
	[PaymentMethod.INTERNATIONAL_CARD]: {
		category: 'FIAT',
		name: 'Международные карты',
		description: 'Оплата картой зарубежных банков',
		providers: [PaymentProvider.ROBOKASSA, PaymentProvider.PRODAMUS]
	},
	[PaymentMethod.CRYPTO]: {
		category: 'CRYPTO',
		name: 'Криптовалюта',
		description: 'Оплата в криптовалюте - USDT, TON, BTC и другие',
		providers: [PaymentProvider.CRYPTO_BOT, PaymentProvider.HELEKET]
	},
	[PaymentMethod.TELEGRAM_STARS]: {
		category: 'STARS',
		name: 'Telegram Stars',
		description: 'Оплата звёздами Telegram, без банковской карты',
		providers: [PaymentProvider.TELEGRAM]
	}
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
	PaymentProvider.CRYPTO_BOT,
	PaymentProvider.HELEKET,
	PaymentProvider.TELEGRAM
])

const resolveProvider = (method: PaymentMethod): PaymentProvider | null =>
	METHODS[method].providers.find((provider) => IMPLEMENTED_PROVIDERS.has(provider)) ?? null

export const listPaymentMethods = () => ({
	categories: CATEGORY_ORDER.map((category) => ({
		id: category,
		name: CATEGORY_NAMES[category],
		methods: Object.entries(METHODS)
			.filter(([, definition]) => definition.category === category)
			.map(([id, definition]) => ({
				id: id as PaymentMethod,
				name: definition.name,
				description: definition.description,
				isAvailable: resolveProvider(id as PaymentMethod) !== null
			}))
	}))
})

interface Product {
	kind: 'subscription' | 'course'
	amount: number
	description: string
	courseId?: string
	stars?: number
}

const resolveProduct = async (courseId: string | undefined): Promise<Product> => {
	if (!courseId) {
		return {
			kind: 'subscription',
			amount: PREMIUM_PLAN.amount,
			description: PREMIUM_PLAN.description,
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
			const created = await createYookassaPayment({
				amount: payment.amount,
				description: product.description,
				returnUrl: RETURN_URL,
				metadata: { paymentId: payment.id }
			})

			const url = created.confirmation?.confirmation_url

			if (!url) {
				throw new InternalError('Provider returned no confirmation URL')
			}

			return { url, pspIntentId: created.id }
		}

		case PaymentProvider.ROBOKASSA: {
			const recurring = product.kind === 'subscription'

			const url = createInvoiceUrl({
				invoiceId: payment.invoiceNumber,
				amount: payment.amount,
				description: product.description,
				email: email ?? undefined,
				recurring,
				customParams: { paymentId: payment.id }
			})

			return { url, pspIntentId: String(payment.invoiceNumber) }
		}

		case PaymentProvider.CRYPTO_BOT: {
			const invoice = await createInvoice({
				fiat: CURRENCY,
				amount: payment.amount,
				description: product.description,
				payload: payment.id,
				returnUrl: RETURN_URL
			})

			return {
				url: invoice.bot_invoice_url,
				pspIntentId: String(invoice.invoice_id)
			}
		}

		case PaymentProvider.HELEKET: {
			const invoice = await createHeleketInvoice({
				orderId: payment.id,
				amount: payment.amount,
				returnUrl: RETURN_URL,
				additionalData: product.description
			})

			return { url: invoice.url, pspIntentId: invoice.uuid }
		}

		case PaymentProvider.TELEGRAM: {
			if (!product.stars) {
				throw new BadRequestError('Telegram Stars pricing is not set up for this purchase yet')
			}

			const url = await createInvoiceLink({
				title: 'TeaCoder',
				description: product.description,
				payload: payment.id,
				amount: product.stars
			})

			return { url, pspIntentId: null }
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

export const createPayment = async (
	userId: string,
	input: CreatePaymentInput,
	idempotencyKey?: string
) => {
	if (idempotencyKey) {
		const existing = await findPaymentByIdempotencyKey(userId, idempotencyKey)

		if (existing) return toResponse(existing)
	}

	const provider = resolveProvider(input.method)

	if (!provider) {
		throw new BadRequestError(`Payment method ${input.method} is not available yet`)
	}

	const product = await resolveProduct(input.courseId)
	const email = (await getUserEmail(userId)) ?? input.email ?? null

	const payment = await createPendingPayment({
		userId,
		amount: product.amount,
		currency: CURRENCY,
		method: input.method,
		provider,
		courseId: product.courseId,
		idempotencyKey,
		metadata: {
			email,
			description: product.description,
			...(product.courseId ? { courseId: product.courseId } : {})
		}
	})

	try {
		const { url, pspIntentId } = await startAtProvider(payment, product, email)

		await attachProviderPayment(payment.id, pspIntentId, { url })

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

		if (err instanceof AppError) throw err

		throw new BadRequestError('Payment provider is unavailable, try again later')
	}
}

export const cancelSubscription = async (userId: string) => {
	const cancelled = await cancelSubscriptionRow(userId)

	if (cancelled) logger.info({ userId }, 'subscription_cancelled')

	return { cancelled: Boolean(cancelled) }
}
