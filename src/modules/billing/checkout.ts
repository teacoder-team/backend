import { IntentStatus, type PaymentIntent, type PaymentMethod } from '@prisma/generated/client'

import { ConflictError, ValidationError } from '~/lib/errors'

import { expireCheckouts, findOpenCheckouts, findPaymentByIdempotencyKey } from './repository'

export const CHECKOUT_TTL_SECONDS = 60 * 60

export interface CheckoutRequest {
	userId: string
	method: PaymentMethod
	courseId: string | null
	idempotencyKey?: string
}

const checkoutUrl = (intent: PaymentIntent) =>
	(intent.pspPayload as { url?: string } | null)?.url ?? null

const expiresAt = (intent: PaymentIntent) =>
	new Date(intent.createdAt.getTime() + CHECKOUT_TTL_SECONDS * 1000)

const productName = (courseId: string | null) => (courseId ? 'course' : 'subscription')

const isStale = (intent: PaymentIntent, now: number) =>
	intent.status === IntentStatus.REQUIRES_PAYMENT &&
	(!checkoutUrl(intent) || expiresAt(intent).getTime() <= now)

export const findIdempotentReplay = async ({
	userId,
	method,
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

	if (previous.method !== method || previous.courseId !== courseId) {
		throw new ValidationError('Idempotency-Key was already used with different parameters')
	}

	return previous
}

/** Must run under the checkout lock, or two requests could both see no open invoice. */
export const findReusableCheckout = async ({ userId, method, courseId }: CheckoutRequest) => {
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

	const sameMethod = live.find((intent) => intent.method === method)

	if (sameMethod) {
		return sameMethod
	}

	const other = live[0]

	if (other) {
		throw new ConflictError(
			`An unpaid ${other.method} invoice for this ${productName(courseId)} is open until ${expiresAt(other).toISOString()} - pay it or retry after that`
		)
	}

	return null
}
