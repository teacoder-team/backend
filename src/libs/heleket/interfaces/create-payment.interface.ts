/**
 * Валюта для создания счета-фактуры
 */
export interface Currency {
	/** Код валюты */
	currency: string
	/** Сетевой код блокчейна (опционально) */
	network?: string
}

/**
 * Параметры запроса для создания счета-фактуры (Create Payment Request)
 */
export interface CreatePaymentRequest {
	/** Сумма счета-фактуры */
	amount: string
	/** Код валюты */
	currency: string
	/** Идентификатор заказа в вашей системе */
	order_id: string
	/** Сетевой код блокчейна (опционально) */
	network?: string
	/** URL для возврата пользователя после успешного платежа */
	url_return?: string
	/** URL для возврата пользователя после успешного платежа */
	url_success?: string
	/** URL для webhook уведомления о платеже */
	url_callback?: string
	/** Разрешить множественные платежи по счету */
	is_payment_multiple?: boolean
	/** Время жизни счета в секундах */
	lifetime?: number
	/** Код валюты, в которую нужно конвертировать платеж */
	to_currency?: string
	/** Сумма для вычитания из платежа */
	subtract?: number
	/** Точность оплаты в процентах */
	accuracy_payment_percent?: number
	/** Дополнительная информация */
	additional_data?: string
	/** Массив валют, доступных для оплаты */
	currencies?: Currency[]
	/** Массив валют, которые запрещены для оплаты */
	except_currencies?: Currency[]
	/** Источник курса валют */
	course_source?: string
	/** Реферальный код */
	from_referral_code?: string
	/** Процент скидки или комиссии для счета */
	discount_percent?: number
	/** Флаг обновления существующего счета */
	is_refresh?: boolean
	/** Email плательщика */
	payer_email?: string
}

/**
 * Информация о конвертации валюты для платежа.
 */
export interface ConvertInfo {
	/** Код валюты, в которую будет конвертирован платеж */
	to_currency: string
	/** Комиссия за конвертацию */
	commission: string
	/** Коэффициент конверсии */
	rate: string
	/** Сумма конвертации в to_currency, которая была добавлена на баланс продавца с вычетом комиссий */
	amount: string
}

/**
 * Ответ от API при создании счета-фактуры (Create Payment)
 */
export interface CreatePaymentResponse {
	/** UUID счета-фактуры */
	uuid: string
	/** Идентификатор заказа в вашей системе */
	order_id: string
	/** Сумма счета-фактуры */
	amount: string
	/** Сумма, фактически уплаченная клиентом (может быть null, если платеж ещё не совершен) */
	payment_amount: string | null
	/** Сумма в payer_currency, которую клиент должен оплатить, включая скидку или комиссию */
	payer_amount: string
	/** Процент скидки или дополнительной комиссии */
	discount_percent: number
	/** Фактическая сумма скидки или комиссии */
	discount: string
	/** Валюта, в которой клиент должен произвести платеж; null если клиент может выбрать валюту */
	payer_currency: string | null
	/** Код валюты счета-фактуры */
	currency: string
	/** Сумма в криптовалюте, которая будет зачислена на ваш баланс; null если не указано */
	merchant_amount: string | null
	/** Сетевой код блокчейна */
	network?: string
	/** Адрес кошелька для оплаты */
	address?: string
	/** Адрес кошелька, с которого был произведен платеж */
	from?: string | null
	/** Хэш транзакции в блокчейне */
	txid?: string | null
	/** Статус платежа */
	payment_status: string
	/** URL платежной страницы */
	url: string
	/** Временная отметка истечения срока действия счета-фактуры */
	expired_at: number
	/** Завершена ли счет-фактура */
	is_final: boolean
	/** Дополнительная информация */
	additional_data?: string | null
	/** Дата создания счета-фактуры (UTC+3) */
	created_at: string
	/** Дата последнего обновления счета-фактуры (UTC+3) */
	updated_at: string
	/** QR-код с адресом кошелька для оплаты */
	address_qr_code?: string
	/** Сумма, фактически уплаченная клиентом в долларах США */
	payment_amount_usd?: string
	/** Сумма комиссии Heleket */
	commission?: string
	/** Информация о валюте, в которую будет автоматически конвертирован платеж */
	convert?: ConvertInfo
	/** Курс обмена для payer_amount */
	payer_amount_exchange_rate?: string
	/** Комментарии к платежу */
	comments?: string | null
	/** Дублирующий статус платежа */
	status?: string
}
