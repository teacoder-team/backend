import type { Prisma } from '@prisma/generated/client'
import { IntentStatus, type PaymentMethod, type PaymentProvider } from '@prisma/generated/client'

import { db } from '~/lib/db'
import { createCoursePurchase, findCoursePurchase } from '~/modules/course/repository'

export interface NewPayment {
	userId: string
	amount: number
	currency: string
	method: PaymentMethod
	provider: PaymentProvider
	courseId?: string
	idempotencyKey?: string
	metadata: Prisma.InputJsonValue
}

export const createPendingPayment = (data: NewPayment) =>
	db.paymentIntent.create({ data: { ...data, status: IntentStatus.REQUIRES_PAYMENT } })

export const attachProviderPayment = (
	paymentId: string,
	pspIntentId: string | null,
	pspPayload: Prisma.InputJsonValue
) =>
	db.paymentIntent.update({
		where: { id: paymentId },
		data: { pspIntentId, pspPayload }
	})

export const markPaymentFailed = (paymentId: string, failureCode?: string) =>
	db.paymentIntent.update({
		where: { id: paymentId },
		data: { status: IntentStatus.FAILED, failureCode }
	})

export const findPaymentById = (userId: string, paymentId: string) =>
	db.paymentIntent.findFirst({ where: { id: paymentId, userId } })

export const findPaymentByProviderId = (provider: PaymentProvider, pspIntentId: string) =>
	db.paymentIntent.findFirst({ where: { provider, pspIntentId } })

export const findPaymentByIdempotencyKey = (userId: string, idempotencyKey: string) =>
	db.paymentIntent.findFirst({ where: { userId, idempotencyKey } })

export const findPaymentForFulfillment = (paymentId: string) =>
	db.paymentIntent.findUnique({
		where: { id: paymentId },
		select: {
			id: true,
			userId: true,
			provider: true,
			pspIntentId: true,
			amount: true,
			currency: true,
			status: true,
			courseId: true
		}
	})

export type FulfillableIntent = NonNullable<Awaited<ReturnType<typeof findPaymentForFulfillment>>>

export interface CourseCapture {
	id: string
	userId: string
	courseId: string
	amount: number
	currency: string
}

/**
 * Flips the intent to CAPTURED and grants the course in one transaction. The
 * conditional update is the concurrency guard - only one caller ever gets past it.
 */
export const captureCoursePayment = (intent: CourseCapture) =>
	db.$transaction(async (tx) => {
		const { count } = await tx.paymentIntent.updateMany({
			where: { id: intent.id, status: { not: IntentStatus.CAPTURED } },
			data: { status: IntentStatus.CAPTURED, failureCode: null }
		})

		if (count === 0) return 'already_captured' as const

		if (await findCoursePurchase(intent.userId, intent.courseId, tx)) {
			return 'already_owned' as const
		}

		await createCoursePurchase(
			{
				userId: intent.userId,
				courseId: intent.courseId,
				pricePaid: intent.amount,
				currency: intent.currency,
				paymentId: intent.id
			},
			tx
		)

		return 'granted' as const
	})

/** Moves a still-pending intent forward. Settled intents never regress on late or out-of-order events. */
export const transitionPendingPayment = async (
	paymentId: string,
	status: IntentStatus,
	failureCode: string | null
) => {
	const { count } = await db.paymentIntent.updateMany({
		where: {
			id: paymentId,
			status: {
				in: [IntentStatus.REQUIRES_PAYMENT, IntentStatus.PROCESSING],
				not: status
			}
		},
		data: { status, failureCode }
	})

	return count > 0
}
