import { type Static, t } from 'elysia'

import { PaymentMethod, PaymentProvider, PaymentStatus } from '@prisma/generated/client'

import { PrismaEnum } from '~/shared/api'

export const CreatePaymentPayload = t.Object({
	method: PrismaEnum(PaymentMethod, {
		description: 'How the user wants to pay. Decides the provider.',
		examples: [PaymentMethod.BANK_CARD]
	}),
	courseId: t.Optional(
		t.String({
			description: 'Buy this specific course instead of the premium subscription.',
			examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d']
		})
	),
	email: t.Optional(
		t.String({
			format: 'email',
			description:
				'Only needed when the account has no email of its own — the receipt goes here.',
			examples: ['torvalds.l@teacoder.com']
		})
	)
})

export const CreatePaymentResponse = t.Object({
	paymentId: t.String({
		description: 'Our own payment id. Quote it in support requests.',
		examples: ['0f2a1c3e-9b7d-4a51-8c62-1d4e5f6a7b8c']
	}),
	status: PrismaEnum(PaymentStatus, { examples: [PaymentStatus.PENDING] }),
	provider: PrismaEnum(PaymentProvider, {
		description: 'Integration the payment was routed to.',
		examples: [PaymentProvider.YOOKASSA]
	}),
	method: PrismaEnum(PaymentMethod, { examples: [PaymentMethod.BANK_CARD] }),
	amount: t.Number({
		description: 'What the user is being charged, for display.',
		examples: [449]
	}),
	currency: t.String({ examples: ['RUB'] }),
	description: t.String({
		description: 'What is being paid for, as the provider shows it.',
		examples: ['Оплата премиум-подписки на 1 месяц']
	}),
	url: t.String({
		description: 'Send the user here to complete the payment.',
		examples: ['https://yoomoney.ru/checkout/payments/v2/contract?orderId=...']
	})
})

export const CancelSubscriptionResponse = t.Object({
	cancelled: t.Boolean({
		description: 'Whether an active subscription actually existed to cancel.',
		examples: [true]
	})
})

const PaymentMethodCategoryId = t.Union(
	[t.Literal('FIAT'), t.Literal('CRYPTO'), t.Literal('STARS')],
	{ description: 'How this method is grouped for display.' }
)

const PaymentMethodEntry = t.Object({
	id: PrismaEnum(PaymentMethod, { examples: [PaymentMethod.BANK_CARD] }),
	name: t.String({ examples: ['Банковская карта'] }),
	description: t.String({ examples: ['Оплата картой российских банков'] }),
	isAvailable: t.Boolean({
		description: 'Whether this method is wired up to a working provider right now.',
		examples: [true]
	})
})

const PaymentMethodCategory = t.Object({
	id: PaymentMethodCategoryId,
	name: t.String({ examples: ['Банковские способы'] }),
	methods: t.Array(PaymentMethodEntry)
})

export const PaymentMethodsResponse = t.Object({
	categories: t.Array(PaymentMethodCategory)
})

export type CreatePaymentInput = Static<typeof CreatePaymentPayload>
