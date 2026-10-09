import { IntentStatus, PaymentProvider, type Prisma } from '@prisma/generated/client'

import { db } from '~/lib/db'
import { createCoursePurchase, findCoursePurchase } from '~/modules/course/repository'
import type { SubscriptionState, SubscriptionTerm } from '~/modules/subscription/model'

import type { CourseCapture, NewPayment, SavedPaymentMethod } from './model'

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
		data: { status: IntentStatus.FAILED, failureCode, idempotencyKey: null }
	})

export const findPaymentById = (userId: string, paymentId: string) =>
	db.paymentIntent.findFirst({ where: { id: paymentId, userId } })

export const findPaymentByProviderId = (provider: PaymentProvider, pspIntentId: string) =>
	db.paymentIntent.findFirst({ where: { provider, pspIntentId } })

export const findPaymentByIdempotencyKey = (userId: string, idempotencyKey: string) =>
	db.paymentIntent.findUnique({ where: { userId_idempotencyKey: { userId, idempotencyKey } } })

export const findOpenCheckouts = (userId: string, courseId: string | null) =>
	db.paymentIntent.findMany({
		where: {
			userId,
			courseId,
			subscriptionId: null,
			status: { in: [IntentStatus.REQUIRES_PAYMENT, IntentStatus.PROCESSING] }
		},
		orderBy: { createdAt: 'desc' }
	})

export const expireCheckouts = (paymentIds: string[]) =>
	db.paymentIntent.updateMany({
		where: { id: { in: paymentIds }, status: IntentStatus.REQUIRES_PAYMENT },
		data: { status: IntentStatus.EXPIRED, failureCode: 'checkout_expired' }
	})

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
			courseId: true,
			subscriptionId: true,
			metadata: true
		}
	})

export type FulfillableIntent = NonNullable<Awaited<ReturnType<typeof findPaymentForFulfillment>>>

export const captureCoursePayment = (intent: CourseCapture) =>
	db.$transaction(async (tx) => {
		const { count } = await tx.paymentIntent.updateMany({
			where: { id: intent.id, status: { not: IntentStatus.CAPTURED } },
			data: { status: IntentStatus.CAPTURED, failureCode: null }
		})

		if (count === 0) {
			return 'already_captured' as const
		}

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

export type SubscriptionCapture =
	| { result: 'already_captured' }
	| { result: 'granted'; subscriptionId: string; term: SubscriptionTerm }

export const captureSubscriptionPayment = (
	paymentId: string,
	userId: string,
	decide: (current: SubscriptionState | null) => SubscriptionTerm
) =>
	db.$transaction(async (tx): Promise<SubscriptionCapture> => {
		const { count } = await tx.paymentIntent.updateMany({
			where: { id: paymentId, status: { not: IntentStatus.CAPTURED } },
			data: { status: IntentStatus.CAPTURED, failureCode: null }
		})

		if (count === 0) {
			return { result: 'already_captured' }
		}

		await tx.$queryRaw`SELECT 1 FROM "users" WHERE "id" = ${userId} FOR UPDATE`

		const current = await tx.subscription.findUnique({
			where: { userId },
			select: { id: true, isActive: true, startedAt: true, expiresAt: true }
		})
		const term = decide(current)

		const period = { isActive: true, startedAt: term.startedAt, expiresAt: term.expiresAt }
		const subscription = await tx.subscription.upsert({
			where: { userId },
			create: { userId, ...period },
			update: period,
			select: { id: true }
		})

		await tx.paymentIntent.update({
			where: { id: paymentId },
			data: { subscriptionId: subscription.id }
		})

		return { result: 'granted', subscriptionId: subscription.id, term }
	})

export const saveUserPaymentMethod = (userId: string, method: SavedPaymentMethod) =>
	db.userPaymentMethod.upsert({
		where: { providerId: method.providerId },
		create: { userId, provider: PaymentProvider.YOOKASSA, ...method },
		update: { ...method, isActive: true },
		select: { id: true }
	})

export const linkPaymentMethod = (paymentId: string, paymentMethodId: string) =>
	db.paymentIntent.update({ where: { id: paymentId }, data: { paymentMethodId } })

export const findChargeableMethod = (userId: string) =>
	db.userPaymentMethod.findFirst({
		where: { userId, provider: PaymentProvider.YOOKASSA, isActive: true },
		orderBy: { updatedAt: 'desc' },
		select: { id: true, providerId: true, type: true, title: true, last4: true }
	})
