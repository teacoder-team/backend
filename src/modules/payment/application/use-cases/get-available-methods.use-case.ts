import { Injectable } from '@nestjs/common'
import { PaymentMethod } from '@prisma/generated'
import { lookup } from 'geoip-country'

import { PaymentMethodResponse } from '../dto/payment-method.dto'

@Injectable()
export class GetAvailableMethodsUseCase {
	private readonly CRYPTO_BLOCKED = [
		'RU',
		'CN',
		'EG',
		'DZ',
		'AF',
		'BD',
		'TN',
		'NP',
		'MA',
		'BO',
		'IQ',
		'PK',
		'KW',
		'NC',
		'XK',
		'MM',
		'MZ',
		'BI',
		'GN',
		'HT',
		'HN'
	]

	public execute(ip: string): PaymentMethodResponse[] {
		const country = this.getCountryCode(ip)

		const methods: PaymentMethodResponse[] = [
			{
				id: PaymentMethod.BANK_CARD,
				name: 'Банковская карта',
				description: 'Оплата картой российских банков',
				isAvailable: true
			},
			{
				id: PaymentMethod.SBP,
				name: 'СБП',
				description: 'Оплата через Систему Быстрых Платежей',
				isAvailable: true
			},
			{
				id: PaymentMethod.T_PAY,
				name: 'T-Pay',
				description: 'Оплата через приложение Т-Банка',
				isAvailable: true
			},
			// {
			// 	id: PaymentMethod.YOOMONEY,
			// 	name: 'ЮMoney',
			// 	description: 'Оплата через кошелек ЮMoney',
			// 	icon: YoomoneyIcon,
			// 	isAvailable: true
			// },
			{
				id: PaymentMethod.CRYPTO,
				name: 'Криптовалюта',
				description: 'BTC, TON, USDT',
				isAvailable: true
			}
			// {
			// 	id: PaymentMethod.INTERNATIONAL_CARD,
			// 	name: 'Международные карты',
			// 	description: 'Оплата картой зарубежных банков',
			// 	isAvailable: true
			// }
			// {
			// 	id: PaymentMethod.TELEGRAM_STARS,
			// 	name: 'Telegram Stars',
			// 	description: 'Оплата подписки через звёзды Telegram',
			// 	isAvailable: false
			// }
		]

		return methods.filter(
			m =>
				!(
					m.id === PaymentMethod.CRYPTO &&
					this.CRYPTO_BLOCKED.includes(country)
				)
		)
	}

	private getCountryCode(ip: string): string {
		try {
			const result = lookup(ip)

			return result.country ?? 'UNKNOWN'
		} catch {
			return 'UNKNOWN'
		}
	}
}
