/** Система налогообложения */
export enum SnoType {
	/** Общая СН */
	OSN = 'osn',
	/** УСН (доходы) */
	USN_INCOME = 'usn_income',
	/** УСН (доходы минус расходы) */
	USN_INCOME_OUTCOME = 'usn_income_outcome',
	/** Единый сельхозналог */
	ESN = 'esn',
	/** Патент */
	PATENT = 'patent'
}

/** Способ расчёта */
export enum PaymentMethodType {
	FULL_PREPAYMENT = 'full_prepayment',
	PREPAYMENT = 'prepayment',
	ADVANCE = 'advance',
	FULL_PAYMENT = 'full_payment',
	PARTIAL_PAYMENT = 'partial_payment',
	CREDIT = 'credit',
	CREDIT_PAYMENT = 'credit_payment'
}

/** Предмет расчёта */
export enum PaymentObjectType {
	COMMODITY = 'commodity',
	EXCISE = 'excise',
	JOB = 'job',
	SERVICE = 'service',
	GAMBLING_BET = 'gambling_bet',
	GAMBLING_PRIZE = 'gambling_prize',
	LOTTERY = 'lottery',
	LOTTERY_PRIZE = 'lottery_prize',
	INTELLECTUAL_ACTIVITY = 'intellectual_activity',
	PAYMENT = 'payment',
	AGENT_COMMISSION = 'agent_commission',
	COMPOSITE = 'composite',
	RESORT_FEE = 'resort_fee',
	ANOTHER = 'another',
	PROPERTY_RIGHT = 'property_right',
	NON_OPERATING_GAIN = 'non-operating_gain',
	INSURANCE_PREMIUM = 'insurance_premium',
	SALES_TAX = 'sales_tax',
	TOVAR_MARK = 'tovar_mark'
}

/** Ставка НДС */
export enum TaxType {
	NONE = 'none',
	VAT0 = 'vat0',
	VAT10 = 'vat10',
	VAT110 = 'vat110',
	VAT20 = 'vat20',
	VAT120 = 'vat120',
	VAT5 = 'vat5',
	VAT7 = 'vat7',
	VAT105 = 'vat105',
	VAT107 = 'vat107'
}
