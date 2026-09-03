import {
	PaymentMethod,
	PaymentProvider,
	PaymentStatus,
} from '@prisma/generated/client'
import { t, type Static } from 'elysia'

import { ApiResponse, PrismaEnum } from '@/shared/api'

export const InitPaymentPayload = t.Object({
	method: PrismaEnum(PaymentMethod, {
		description: 'How the user wants to pay. Decides the provider.',
		examples: [PaymentMethod.BANK_CARD],
	}),
	email: t.Optional(
		t.String({
			format: 'email',
			description:
				'Only needed when the account has no email of its own — the receipt goes here.',
			examples: ['torvalds.l@teacoder.com'],
		}),
	),
})

const InitPaymentResult = t.Object({
	paymentId: t.String({
		description: 'Our own payment id. Quote it in support requests.',
		examples: ['0f2a1c3e-9b7d-4a51-8c62-1d4e5f6a7b8c'],
	}),
	status: PrismaEnum(PaymentStatus, { examples: [PaymentStatus.PENDING] }),
	provider: PrismaEnum(PaymentProvider, {
		description: 'Integration the payment was routed to.',
		examples: [PaymentProvider.YOOKASSA],
	}),
	method: PrismaEnum(PaymentMethod, { examples: [PaymentMethod.BANK_CARD] }),
	url: t.String({
		description: 'Send the user here to complete the payment.',
		examples: [
			'https://yoomoney.ru/checkout/payments/v2/contract?orderId=…',
		],
	}),
})

export const InitPaymentResponse = ApiResponse(InitPaymentResult)

export type InitPaymentInput = Static<typeof InitPaymentPayload>
