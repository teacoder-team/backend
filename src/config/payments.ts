import { PaymentMethod, PaymentProvider } from '@prisma/generated/client'

import type { MethodDefinition } from '~/modules/billing/model'

export const PAYMENT_METHODS: Partial<Record<PaymentMethod, MethodDefinition>> = {
	[PaymentMethod.BANK_CARD]: {
		category: 'FIAT',
		name: 'Банковская карта',
		description: 'Оплата картой российских банков',
		provider: PaymentProvider.YOOKASSA
	},
	[PaymentMethod.SBP]: {
		category: 'FIAT',
		name: 'СБП',
		description: 'Оплата через Систему быстрых платежей',
		provider: PaymentProvider.YOOKASSA
	},
	[PaymentMethod.INTERNATIONAL_CARD]: {
		category: 'FIAT',
		name: 'Иностранные карты',
		description: 'Оплата картами банков мира и другими международными способами',
		provider: PaymentProvider.PRODAMUS
	},
	[PaymentMethod.HELEKET]: {
		category: 'CRYPTO',
		name: 'Криптовалюта',
		description: 'USDT, GRAM, BTC и другие',
		provider: PaymentProvider.HELEKET
	}
}

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
