import type {
	Currency,
	NpdIncome,
	PaymentDo,
	ProductPaymentMethod,
	ProductPaymentObject,
	ProductType,
	TaxType
} from '../enums'

export interface Tax {
	/** Тип НДС */
	tax_type: TaxType

	/** Сумма НДС (необязательно) */
	tax_sum?: number
}

/**
 * Товар в заказе
 */
export interface PaymentProduct {
	/** Наименование товара (обязательно) */
	name: string

	/** Цена товара (обязательно) */
	price: number

	/** Количество (обязательно, целое число) */
	quantity: number

	/** SKU товара (необязательно) */
	sku?: string

	/** Тип товара (необязательно, внутренняя логика магазина) */
	type?: ProductType

	/** Налог (НДС) */
	tax?: Tax

	/** Тип оплаты по ФФД (способ расчёта) */
	paymentMethod?: ProductPaymentMethod

	/** Тип предмета расчёта */
	paymentObject?: ProductPaymentObject
}

/**
 * DTO создания платежа
 */
export interface CreatePaymentRequest {
	/**
	 * Действие
	 * link — вернуть ссылку
	 * pay — сразу отправить на оплату
	 */
	do: PaymentDo

	/** Система магазина (согласуется с поддержкой) */
	sys: string

	/** Массив товаров (если нет subscription) */
	products?: PaymentProduct[]

	/** Сумма заказа (необязательно) */
	order_sum?: number

	/** Скидка, руб (необязательно) */
	discount_value?: number

	// ==== Параметры подписки ====

	/** ID подписки (обязательно для рекуррентных) */
	subscription?: number

	/** Дата начала подписки (необязательно) */
	subscription_date_start?: string

	/** Демо-период подписки (дни) */
	subscription_demo_period?: number

	/** Лимит автоплатежей */
	subscription_limit_autopayments?: number

	// ==== VK параметры ====

	/** VK User ID (необязательно) */
	vk_user_id?: number

	/** ФИО пользователя ВК (необязательно) */
	vk_user_name?: string

	// ==== Параметры самозанятых ====

	/** Тип плательщика */
	npd_income_type?: NpdIncome

	/** ИНН клиента (для юр лиц) */
	npd_income_inn?: number

	/** Компания клиента (для юр лиц/иностранных) */
	npd_income_company?: string

	// ==== Общие параметры ====

	/** Внутренний номер заказа магазина */
	order_id?: string

	/** Телефон клиента */
	customer_phone?: string

	/** Email клиента */
	customer_email?: string

	/** Описание заказа */
	customer_extra?: string

	/** Промокод/партнер */
	ref?: string

	/** Платный контент */
	paid_content?: string

	/** Время жизни ссылки */
	link_expired?: string

	/** Метод оплаты, если выбирается в системе магазина */
	payment_method?: string

	/** Список доступных методов оплаты */
	available_payment_methods?: string

	/** URL возврата без оплаты */
	urlReturn?: string

	/** URL возврата при успешной оплате */
	urlSuccess?: string

	/** URL для webhook */
	urlNotification?: string

	/** Случайное поле _param_xxx */
	[key: string]: string | number | PaymentProduct[] | undefined

	/** Отключение рассрочки */
	installments_disabled?: number

	/** Проверка отказа по рассрочке (только тест) */
	demoFlow?: 'reject'

	/** Демо-режим */
	demo_mode?: 0 | 1

	/** Формат ответа */
	type?: 'json'

	/** Формат webhook */
	callbackType?: 'json'

	/** Валюта */
	currency?: Currency

	/** Лимит оплат по ссылке */
	payments_limit?: number

	/** Эквайринг */
	acquiring?: string
}
