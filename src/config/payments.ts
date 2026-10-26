import { PaymentMethod, PaymentProvider } from '@prisma/generated/client'

import type { MethodDefinition } from '~/modules/billing/model'

export const PAYMENT_METHODS: MethodDefinition[] = [
	{
		method: PaymentMethod.BANK_CARD,
		category: 'FIAT',
		name: 'Банковская карта',
		description: 'Оплата картой российских банков',
		provider: PaymentProvider.YOOKASSA
	},
	{
		method: PaymentMethod.SBP,
		category: 'FIAT',
		name: 'СБП',
		description: 'Оплата через Систему быстрых платежей',
		provider: PaymentProvider.YOOKASSA
	},
	{
		method: PaymentMethod.BANK_CARD,
		category: 'FIAT',
		name: 'Банковские карты РФ и СБП (резервный)',
		description: 'Если основной способ недоступен',
		provider: PaymentProvider.ROBOKASSA
	},
	{
		method: PaymentMethod.INTERNATIONAL_CARD,
		category: 'FIAT',
		name: 'Иностранные карты',
		description: 'Оплата картами банков мира',
		provider: PaymentProvider.PRODAMUS
	},
	{
		method: PaymentMethod.YANDEX_SPLIT,
		category: 'FIAT',
		name: 'Яндекс Сплит',
		description: 'Оплата курса частями, без переплаты',
		provider: PaymentProvider.PRODAMUS
	},
	{
		method: PaymentMethod.CRYPTO,
		category: 'CRYPTO',
		name: 'Криптовалюта',
		description: 'USDT, GRAM, BTC и другие',
		provider: PaymentProvider.HELEKET
	}
]

export const PAYMENT_PROVIDER_NAMES: Record<PaymentProvider, string> = {
	[PaymentProvider.YOOKASSA]: 'ЮKassa',
	[PaymentProvider.ROBOKASSA]: 'Robokassa',
	[PaymentProvider.PRODAMUS]: 'Prodamus',
	[PaymentProvider.HELEKET]: 'Heleket',
	[PaymentProvider.CRYPTO_BOT]: 'Crypto Bot',
	[PaymentProvider.CLOUDPAYMENTS]: 'CloudPayments',
	[PaymentProvider.TELEGRAM]: 'Telegram Stars'
}

export const PAYMENT_CATEGORIES = [
	{ id: 'FIAT', name: 'Банковские способы' },
	{ id: 'CRYPTO', name: 'Криптовалюта' },
	{ id: 'STARS', name: 'Telegram Stars' }
] as const
