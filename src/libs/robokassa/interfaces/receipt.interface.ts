import {
	PaymentMethodType,
	PaymentObjectType,
	SnoType,
	TaxType
} from '../enums'

/**
 * Информация о товарной позиции в чеке
 */
export interface ReceiptItem {
	/** Наименование товара / услуги */
	name: string
	/** Количество */
	quantity: number
	/** Общая сумма за позицию (в рублях, с учетом скидок) */
	sum: number
	/** Стоимость за единицу (опционально) */
	cost?: number
	/** Признак способа расчёта */
	payment_method?: PaymentMethodType
	/** Признак предмета расчёта */
	payment_object?: PaymentObjectType
	/** Ставка НДС */
	tax: TaxType
	/** Код маркировки (если товар подлежит маркировке) */
	nomenclature_code?: string
}

/**
 * Объект чека для Robokassa
 */
export interface Receipt {
	/** Система налогообложения */
	sno?: SnoType
	/** Список товарных позиций */
	items: ReceiptItem[]
}
