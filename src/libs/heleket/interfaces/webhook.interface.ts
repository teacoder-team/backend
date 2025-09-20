import { HeleketPaymentStatus } from '../enums'

/**
 * Информация о конвертации валюты для платежа
 */
export interface HeleketPaymentConvert {
	/** Код валюты, в которую будет конвертирован платеж */
	to_currency: string
	/** Комиссия за конвертацию */
	commission: string
	/** Курс конверсии */
	rate: string
	/** Сумма конверсии в to_currency, которая была добавлена на баланс продавца с вычетом комиссии (merchant_amount * rate) */
	amount: string
}

/**
 * Payload webhook от Heleket
 */
export interface HeleketPaymentWebhook {
	/** Тип счета */
	type: 'payment'
	/** UUID платежа */
	uuid: string
	/** Идентификатор заказа в вашей системе */
	order_id: string
	/** Сумма счета-фактуры */
	amount: string
	/** Сумма, фактически уплаченная клиентом (может быть null, если платеж ещё не совершен) */
	payment_amount: string | null
	/** Сумма в долларах США, фактически оплаченная клиентом */
	payment_amount_usd?: string
	/** Сумма, добавленная на баланс продавца с вычетом комиссии */
	merchant_amount: string | null
	/** Сумма комиссии Heleket */
	commission?: string
	/** Завершена ли счет-фактура */
	is_final: boolean
	/** Статус платежа */
	status: HeleketPaymentStatus
	/** Адрес кошелька плательщика */
	from?: string | null
	/** UUID статического кошелька */
	wallet_address_uuid?: string | null
	/** Сеть блокчейна */
	network?: string
	/** Валюта счета-фактуры */
	currency: string
	/** Валюта, которой клиент расплатился */
	payer_currency: string
	/** Сумма в валюте плательщика */
	payer_amount: string
	/** Курс обмена для payer_amount */
	payer_amount_exchange_rate?: string
	/** Дополнительная информация */
	additional_data?: string | null
	/** Идентификатор трансфера */
	transfer_id?: string | null
	/** Хэш транзакции в блокчейне */
	txid?: string | null
	/** Подпись webhook */
	sign: string
	/** Информация о конвертации валюты */
	convert?: HeleketPaymentConvert
}
