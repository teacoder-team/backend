import type { PaymentMethodDetails } from '@teacoder/payments/yookassa'

import {
	IntentStatus,
	type PaymentIntent,
	PaymentMethod,
	PaymentProvider,
	Prisma
} from '@prisma/generated/client'

import { PAYMENT_CATEGORIES, PAYMENT_METHODS } from '~/config/payments'
import {
	AppError,
	BadRequestError,
	ConflictError,
	NotFoundError,
	ValidationError
} from '~/lib/errors'
import {
	billingMethodType,
	type CheckoutProduct,
	createProviderCheckout
} from '~/lib/integrations/payments'
import { LockTakenError, withLock } from '~/lib/lock'
import { extendLogContext, logger } from '~/lib/logger'
import {
	enqueueCoursePurchaseNotification,
	enqueueSubscriptionPurchaseNotification,
	enqueueSubscriptionRenewalNotification
} from '~/modules/admin-bot/service'
import { getUserEmail } from '~/modules/auth/service'
import { enqueueCoursePurchaseEmail } from '~/modules/course/jobs'
import {
	findCourseForPurchase,
	findCoursePurchase,
	findCourseSummary
} from '~/modules/course/repository'
import { isCoursePurchasable, resolveCoursePrice } from '~/modules/course/service'
import {
	enqueueSubscriptionPaymentFailedEmail,
	enqueueSubscriptionPurchaseEmail,
	enqueueSubscriptionRenewedEmail
} from '~/modules/subscription/jobs'
import { endSubscriptionPeriod, setAutoBilling } from '~/modules/subscription/repository'
import { nextTerm, PREMIUM_PLAN, premiumAmount } from '~/modules/subscription/service'

import type {
	CheckoutRequest,
	CreatePaymentInput,
	FulfillmentResult,
	ProviderPaymentUpdate,
	ReplayableIntent,
	SavedPaymentMethod,
	SubscriptionInvoice
} from './model'
import {
	attachProviderPayment,
	captureCoursePayment,
	captureSubscriptionPayment,
	createPendingPayment,
	expireCheckouts,
	findOpenCheckouts,
	findPaymentById,
	findPaymentByIdempotencyKey,
	findPaymentForFulfillment,
	type FulfillableIntent,
	linkPaymentMethod,
	markPaymentFailed,
	saveUserPaymentMethod,
	transitionPendingPayment
} from './repository'

const CURRENCY = 'RUB'

export const listPaymentMethods = () => ({
	categories: PAYMENT_CATEGORIES.map(({ id, name }) => ({
		id,
		name,
		methods: PAYMENT_METHODS.filter((definition) => definition.category === id).map(
			(definition) => ({
				id: definition.method,
				provider: definition.provider,
				name: definition.name,
				description: definition.description,
				isAvailable: true
			})
		)
	}))
})

export const listAvailablePaymentMethods = () =>
	PAYMENT_METHODS.map((definition) => ({
		id: definition.method,
		provider: definition.provider,
		name: definition.name,
		description: definition.description
	}))

const resolveProduct = async (
	courseId: string | undefined,
	method: PaymentMethod
): Promise<CheckoutProduct> => {
	if (!courseId) {
		return {
			kind: 'subscription',
			amount: premiumAmount(method),
			description: PREMIUM_PLAN.description,
			months: PREMIUM_PLAN.months,
			stars: PREMIUM_PLAN.stars
		}
	}

	const course = await findCourseForPurchase(courseId)

	if (!course || !isCoursePurchasable(course)) {
		throw new NotFoundError('Course not found or not for sale')
	}

	const { payable: price } = resolveCoursePrice(course.price, course.discountPrice)

	if (price === null) {
		throw new NotFoundError('Course not found or not for sale')
	}

	return {
		kind: 'course',
		amount: price,
		description: `Покупка курса «${course.title}»`,
		courseId: course.id
	}
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
	product: CheckoutProduct,
	fallbackEmail: string | undefined
) => {
	const { userId, idempotencyKey } = request

	extendLogContext({ provider, userId, product: product.kind })

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
			checkoutMethod: request.method,
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

	extendLogContext({ paymentId: payment.id })

	try {
		const { url, pspIntentId, raw } = await createProviderCheckout(
			payment,
			product,
			email,
			CHECKOUT_TTL_SECONDS
		)

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
		extendLogContext({
			event: 'payment_initialization_failed',
			userId,
			paymentId: payment.id,
			provider,
			errorMessage: err instanceof Error ? err.message : String(err)
		})

		await markPaymentFailed(payment.id)

		if (err instanceof AppError) {
			throw err
		}

		const failure = new BadRequestError('Payment provider is unavailable, try again later')
		failure.cause = err

		throw failure
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

	const provider = request.provider

	const product = await resolveProduct(request.courseId ?? undefined, request.method)

	if (product.courseId && (await findCoursePurchase(request.userId, product.courseId))) {
		throw new ConflictError('Course already purchased')
	}

	const reusable = await findReusableCheckout(request, product.amount)

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

const COURSE_ONLY_METHODS = new Set<PaymentMethod>([PaymentMethod.YANDEX_SPLIT])

export const createPayment = async (
	userId: string,
	input: CreatePaymentInput,
	idempotencyKey?: string
) => {
	if (COURSE_ONLY_METHODS.has(input.method) && !input.courseId) {
		throw new BadRequestError(`Payment method ${input.method} is available only for courses`)
	}

	const definition = PAYMENT_METHODS.find(
		(method) =>
			method.method === input.method &&
			(!input.provider || method.provider === input.provider)
	)

	if (!definition) {
		throw new BadRequestError('Payment method and provider combination is not available')
	}

	const request: CheckoutRequest = {
		userId,
		method: input.method,
		provider: definition.provider,
		courseId: input.courseId ?? null,
		idempotencyKey
	}

	extendLogContext({ userId, provider: request.provider })

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

const CHECKOUT_TTL_SECONDS = 60 * 60

const checkoutUrl = (intent: PaymentIntent) =>
	(intent.pspPayload as { url?: string } | null)?.url ?? null

const expiresAt = (intent: PaymentIntent) =>
	new Date(intent.createdAt.getTime() + CHECKOUT_TTL_SECONDS * 1000)

const productName = (courseId: string | null) => (courseId ? 'course' : 'subscription')

const isStale = (intent: PaymentIntent, now: number) =>
	intent.status === IntentStatus.REQUIRES_PAYMENT &&
	(!checkoutUrl(intent) || expiresAt(intent).getTime() <= now)

const settleStaleCheckout = async (payment: PaymentIntent) => {
	if (payment.subscriptionId || !isStale(payment, Date.now())) {
		return payment.status
	}

	await expireCheckouts([payment.id])

	return IntentStatus.EXPIRED
}

export const getPayment = async (userId: string, paymentId: string) => {
	const payment = await findPaymentById(userId, paymentId)

	if (!payment) {
		throw new NotFoundError('Payment not found')
	}

	const status = await settleStaleCheckout(payment)
	const course = payment.courseId ? await findCourseSummary(payment.courseId) : null
	const metadata = payment.metadata as { description?: string } | null

	return {
		id: payment.id,
		status,
		product: payment.courseId ? ('COURSE' as const) : ('SUBSCRIPTION' as const),
		course:
			payment.courseId && course
				? { id: payment.courseId, title: course.title, slug: course.slug }
				: null,
		amount: payment.amount,
		currency: payment.currency,
		description: metadata?.description ?? '',
		url: status === IntentStatus.REQUIRES_PAYMENT ? checkoutUrl(payment) : null,
		createdAt: payment.createdAt.toISOString()
	}
}

const findIdempotentReplay = async ({
	userId,
	method,
	provider,
	courseId,
	idempotencyKey
}: CheckoutRequest) => {
	if (!idempotencyKey) {
		return null
	}

	const previous = await findPaymentByIdempotencyKey(userId, idempotencyKey)

	if (!previous) {
		return null
	}

	const metadata = previous.metadata as { checkoutMethod?: string } | null

	if (
		(metadata?.checkoutMethod ?? previous.method) !== method ||
		previous.provider !== provider ||
		previous.courseId !== courseId
	) {
		throw new ValidationError('Idempotency-Key was already used with different parameters')
	}

	return previous
}

const findReusableCheckout = async (
	{ userId, method, provider, courseId }: CheckoutRequest,
	amount: number
) => {
	const open = await findOpenCheckouts(userId, courseId)
	const now = Date.now()
	const stale = open.filter((intent) => isStale(intent, now))

	if (stale.length) {
		await expireCheckouts(stale.map((intent) => intent.id))
	}

	const live = open.filter((intent) => !stale.includes(intent))

	if (live.some((intent) => intent.status === IntentStatus.PROCESSING)) {
		throw new ConflictError(
			`A payment for this ${productName(courseId)} is already being processed`
		)
	}

	const sameMethod = live.find(
		(intent) => intent.method === method && intent.provider === provider
	)

	if (!sameMethod) {
		return null
	}

	if (toMinorUnits(sameMethod.amount) === toMinorUnits(amount)) {
		return sameMethod
	}

	await expireCheckouts([sameMethod.id], 'price_changed')

	extendLogContext({
		event: 'checkout_price_changed',
		userId,
		paymentId: sameMethod.id,
		previousAmount: sameMethod.amount,
		amount
	})

	return null
}

const toMinorUnits = (value: string | number) => Math.round(Number(value) * 100)

const rejectionReason = (intent: FulfillableIntent | null, update: ProviderPaymentUpdate) => {
	if (!intent) {
		return 'unknown_payment'
	}

	if (intent.provider !== update.provider) {
		return 'provider_mismatch'
	}

	if (intent.pspIntentId && intent.pspIntentId !== update.pspIntentId) {
		return 'psp_intent_mismatch'
	}

	if (
		toMinorUnits(update.amount) !== toMinorUnits(intent.amount) ||
		update.currency !== intent.currency
	) {
		return 'amount_mismatch'
	}

	return null
}

const capture = async (
	intent: FulfillableIntent & { courseId: string },
	method?: PaymentMethod
): Promise<FulfillmentResult> => {
	const result = await captureCoursePayment({
		method,
		id: intent.id,
		userId: intent.userId,
		courseId: intent.courseId,
		amount: intent.amount,
		currency: intent.currency
	})

	if (result === 'already_captured') {
		return { outcome: 'already_captured' }
	}

	if (result === 'already_owned') {
		logger.warn(
			{
				context: 'billing',
				paymentId: intent.id,
				userId: intent.userId,
				courseId: intent.courseId
			},
			'course_payment_captured_but_already_owned'
		)

		return { outcome: 'already_owned', courseId: intent.courseId }
	}

	await enqueueCoursePurchaseEmail({ userId: intent.userId, courseId: intent.courseId }).catch(
		(err: unknown) => {
			logger.warn(
				{ context: 'billing', paymentId: intent.id, err },
				'course_purchase_email_enqueue_failed'
			)
		}
	)

	await enqueueCoursePurchaseNotification({ paymentId: intent.id })

	return { outcome: 'course_granted', courseId: intent.courseId }
}

const readInvoice = (metadata: unknown): SubscriptionInvoice => {
	const raw = (metadata ?? {}) as Record<string, unknown>
	const months = raw.months

	return {
		months:
			typeof months === 'number' && Number.isInteger(months) && months > 0
				? months
				: PREMIUM_PLAN.months,
		renewal: raw.renewal === true,
		periodEnd: typeof raw.periodEnd === 'string' ? raw.periodEnd : null
	}
}

const warnOnFailure = (paymentId: string, message: string) => (err: unknown) => {
	logger.warn({ context: 'billing', paymentId, err }, message)
}

const keepPaymentMethod = async (
	intent: FulfillableIntent,
	invoice: SubscriptionInvoice,
	saved: SavedPaymentMethod | undefined
) => {
	if (invoice.renewal || saved?.provider === PaymentProvider.ROBOKASSA) {
		return
	}

	if (!saved) {
		logger.warn(
			{ context: 'billing', paymentId: intent.id, userId: intent.userId },
			'payment_method_not_saved'
		)

		return
	}

	const method = await saveUserPaymentMethod(intent.userId, saved)

	await linkPaymentMethod(intent.id, method.id)
	await setAutoBilling(intent.userId, true)

	extendLogContext({ event: 'subscription_auto_renew_enabled', userId: intent.userId })
}

const captureSubscription = async (
	intent: FulfillableIntent,
	update: ProviderPaymentUpdate
): Promise<FulfillmentResult> => {
	const invoice = readInvoice(intent.metadata)
	const captured = await captureSubscriptionPayment(
		intent.id,
		intent.userId,
		(current) => nextTerm(current, invoice.months),
		update.method,
		!invoice.renewal && update.savedMethod?.provider === PaymentProvider.ROBOKASSA
			? update.savedMethod
			: undefined
	)

	if (captured.result === 'already_captured') {
		return { outcome: 'already_captured' }
	}

	const { term } = captured
	const extended = term.kind === 'extended'

	await keepPaymentMethod(intent, invoice, update.savedMethod).catch(
		warnOnFailure(intent.id, 'payment_method_save_failed')
	)

	if (invoice.renewal) {
		await enqueueSubscriptionRenewedEmail({ paymentId: intent.id }).catch(
			warnOnFailure(intent.id, 'subscription_renewed_email_enqueue_failed')
		)
		await enqueueSubscriptionRenewalNotification({ paymentId: intent.id, outcome: 'charged' })
	} else {
		await enqueueSubscriptionPurchaseEmail({ userId: intent.userId, extended }).catch(
			warnOnFailure(intent.id, 'subscription_purchase_email_enqueue_failed')
		)
		await enqueueSubscriptionPurchaseNotification({
			paymentId: intent.id,
			months: invoice.months,
			previousExpiresAt: term.previousExpiresAt?.toISOString() ?? null
		})
	}

	return { outcome: 'subscription_granted', expiresAt: term.expiresAt.toISOString(), extended }
}

const SETTLED_UNPAID = new Set<IntentStatus>([
	IntentStatus.FAILED,
	IntentStatus.CANCELLED,
	IntentStatus.EXPIRED
])

type RenewalIntent = Pick<FulfillableIntent, 'id' | 'userId' | 'subscriptionId' | 'metadata'>

export const endDeclinedRenewal = async (intent: RenewalIntent) => {
	const { periodEnd } = readInvoice(intent.metadata)

	if (!intent.subscriptionId || !periodEnd) {
		return
	}

	if (!(await endSubscriptionPeriod(intent.subscriptionId, new Date(periodEnd)))) {
		return
	}

	logger.info(
		{ context: 'billing', paymentId: intent.id, userId: intent.userId },
		'subscription_renewal_declined'
	)

	await enqueueSubscriptionPaymentFailedEmail({ userId: intent.userId }).catch(
		warnOnFailure(intent.id, 'subscription_payment_failed_email_enqueue_failed')
	)
	await enqueueSubscriptionRenewalNotification({ paymentId: intent.id, outcome: 'declined' })
}

const applyToPayment = async (
	intent: FulfillableIntent,
	update: ProviderPaymentUpdate
): Promise<FulfillmentResult> => {
	if (update.status === IntentStatus.CAPTURED) {
		return intent.courseId
			? capture({ ...intent, courseId: intent.courseId }, update.method)
			: captureSubscription(intent, update)
	}

	if (update.status === IntentStatus.REQUIRES_PAYMENT) {
		return { outcome: 'unchanged' }
	}

	const changed = await transitionPendingPayment(
		intent.id,
		update.status,
		update.failureCode ?? null
	)

	if (changed && SETTLED_UNPAID.has(update.status) && readInvoice(intent.metadata).renewal) {
		await endDeclinedRenewal(intent)
	}

	return changed ? { outcome: 'status_updated', status: update.status } : { outcome: 'unchanged' }
}

export const applyPaymentUpdate = async (
	update: ProviderPaymentUpdate
): Promise<FulfillmentResult> => {
	const intent = await findPaymentForFulfillment(update.paymentId)
	const reason = rejectionReason(intent, update)

	if (reason || !intent) {
		logger.error(
			{ context: 'billing', paymentId: update.paymentId, provider: update.provider, reason },
			'payment_update_rejected'
		)

		return { outcome: 'rejected', reason: reason ?? 'unknown_payment' }
	}

	const result = await applyToPayment(intent, update)

	extendLogContext({
		event: 'payment_update_applied',
		paymentId: intent.id,
		userId: intent.userId,
		status: update.status,
		outcome: result.outcome
	})

	return result
}

const toNumber = (value: string | undefined) => {
	const number = Number(value)

	return Number.isInteger(number) && number > 0 ? number : null
}

export const toSavedMethod = (
	method: PaymentMethodDetails | undefined
): SavedPaymentMethod | undefined => {
	const type = method && billingMethodType(method.type)

	if (!method?.saved || !type) {
		return undefined
	}

	return {
		provider: PaymentProvider.YOOKASSA,
		providerId: method.id,
		type,
		title: method.title ?? null,
		first6: method.card?.first6 ?? null,
		last4: method.card?.last4 ?? null,
		expiryMonth: toNumber(method.card?.expiry_month),
		expiryYear: toNumber(method.card?.expiry_year),
		cardType: method.card?.card_type ?? null
	}
}
