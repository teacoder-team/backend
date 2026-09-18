import type { Prisma } from '@prisma/generated/client'
import { type PaymentMethod, type PaymentProvider, IntentStatus } from '@prisma/generated/client'

import { db } from '~/infra/db'

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
