import type { PaymentMethodDetails } from '@teacoder/payments/yookassa'

import { PaymentMethod } from '@prisma/generated/client'

import type { SavedPaymentMethod } from './repository'

/** YooKassa `payment_method.type` values we can charge again. */
const METHOD_TYPES: Record<string, PaymentMethod> = {
	bank_card: PaymentMethod.BANK_CARD,
	sbp: PaymentMethod.SBP,
	tinkoff_bank: PaymentMethod.T_PAY,
	sberbank: PaymentMethod.SBER_PAY,
	yoo_money: PaymentMethod.YOOMONEY
}

const toNumber = (value: string | undefined) => {
	const number = Number(value)

	return Number.isInteger(number) && number > 0 ? number : null
}

/** Null unless YooKassa actually kept the method and it is a type we know how to show. */
export const toSavedMethod = (
	method: PaymentMethodDetails | undefined
): SavedPaymentMethod | undefined => {
	const type = method && METHOD_TYPES[method.type]

	if (!method?.saved || !type) {
		return undefined
	}

	return {
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
