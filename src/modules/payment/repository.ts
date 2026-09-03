import type { Prisma } from '@prisma/generated/client'
import {
	PaymentStatus,
	type PaymentMethod,
	type PaymentProvider,
} from '@prisma/generated/client'

import { db } from '@/infra/db'

export interface NewPayment {
	userId: string
	amount: number
	currency: string
	method: PaymentMethod
	provider: PaymentProvider
	metadata: Prisma.InputJsonValue
}

export const createPendingPayment = (data: NewPayment) =>
	db.payment.create({ data: { ...data, status: PaymentStatus.PENDING } })

export const attachProviderPayment = (
	paymentId: string,
	providerPaymentId: string,
) =>
	db.payment.update({
		where: { id: paymentId },
		data: { providerPaymentId },
	})

export const markPaymentFailed = (paymentId: string) =>
	db.payment.update({
		where: { id: paymentId },
		data: { status: PaymentStatus.FAILED },
	})

export const findPaymentById = (userId: string, paymentId: string) =>
	db.payment.findFirst({ where: { id: paymentId, userId } })

export const findPaymentByProviderId = (
	provider: PaymentProvider,
	providerPaymentId: string,
) => db.payment.findFirst({ where: { provider, providerPaymentId } })
