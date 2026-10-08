import { PaymentMethod } from '@prisma/generated/client'

export const PREMIUM_PLAN = {
	amount: 449,
	months: 1,
	description: 'Оплата «TeaCoder Premium» на 1 месяц',
	stars: 150
} as const

export const PREMIUM_INTERNATIONAL_AMOUNT = 499

export const premiumAmount = (method: PaymentMethod) =>
	method === PaymentMethod.INTERNATIONAL_CARD ? PREMIUM_INTERNATIONAL_AMOUNT : PREMIUM_PLAN.amount
