import { Injectable } from '@nestjs/common'
import {
	ConfirmationEnum,
	CurrencyEnum,
	PaymentMethodsEnum,
	VatCodesEnum,
	YookassaService
} from 'nestjs-yookassa'

import { PaymentEntity } from '../../domain/entities/payment.entity'

import type { YookassaPort } from './yookassa.port'

@Injectable()
export class YookassaAdapter implements YookassaPort {
	private readonly YooMethodMap: Record<string, PaymentMethodsEnum> = {
		BANK_CARD: PaymentMethodsEnum.BANK_CARD,
		SBP: PaymentMethodsEnum.SBP,
		T_PAY: PaymentMethodsEnum.T_BANK,
		SBER_PAY: PaymentMethodsEnum.SBERBANK,
		YOOMONEY: PaymentMethodsEnum.YOOMONEY
	}

	public constructor(private readonly yookassa: YookassaService) {}

	public async createPayment(payment: PaymentEntity, email: string) {
		const response = await this.yookassa.payments.create({
			amount: {
				value: payment.amount.value,
				currency: payment.amount.currency as CurrencyEnum
			},
			description: 'Оплата премиум-подписки на 1 месяц',
			receipt: {
				customer: {
					email
				},
				items: [
					{
						amount: {
							value: payment.amount.value,
							currency: CurrencyEnum.RUB
						},
						description: 'Премиум-доступ на 30 дней',
						quantity: 1,
						vat_code: VatCodesEnum.NDS_NONE
					}
				]
			},
			payment_method_data: {
				// @ts-ignore
				type: this.YooMethodMap[payment.method.value]
			},
			confirmation: {
				type: ConfirmationEnum.REDIRECT,
				return_url: process.env.HOSTS_APP + '/payment/success'
			},
			...(payment.method.value === 'SBP' && {
				capture: true
			}),
			metadata: {
				payment_id: payment.id
			},
			save_payment_method: true
		})

		return {
			id: response.id,
			// @ts-ignore
			url: response.confirmation?.confirmation_url,
			raw: response
		}
	}

	public async capturePayment(id: string) {
		return this.yookassa.payments.capture(id)
	}

	public async createInvoice(data: any) {
		return this.yookassa.invoices.create(data)
	}
}
