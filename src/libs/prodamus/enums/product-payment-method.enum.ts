/**
 * Способ оплаты (ФФД)
 */
export enum ProductPaymentMethod {
	/** Полная предоплата */
	FULL_PREPAYMENT = 1,
	/** Частичная предоплата */
	PARTIAL_PREPAYMENT = 2,
	/** Аванс */
	ADVANCE = 3,
	/** Полная оплата при передаче товара/услуги */
	FULL_PAYMENT = 4,
	/** Частичная оплата, оставшаяся сумма — кредит */
	PARTIAL_PAYMENT = 5,
	/** Передача товара в кредит */
	CREDIT_TRANSFER = 6,
	/** Оплата кредита */
	CREDIT_PAYMENT = 7
}
