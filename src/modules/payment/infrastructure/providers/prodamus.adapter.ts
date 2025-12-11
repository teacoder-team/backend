import { Injectable } from '@nestjs/common'
import { randomBytes } from 'crypto'

import { PaymentDo } from '@/libs/prodamus/enums'
import { ProdamusService } from '@/libs/prodamus/prodamus.service'

import { PaymentEntity } from '../../domain/entities/payment.entity'

import { ProdamusPort } from './prodamus.port'

@Injectable()
export class ProdamusAdapter implements ProdamusPort {
	private readonly INTERNATIONAL_METHODS: string[]

	public constructor(private readonly prodamus: ProdamusService) {
		this.INTERNATIONAL_METHODS = [
			'ACkz', // Казахстан
			'ACkztjp', // весь мир, кроме РФ
			'ACf', // СНГ, кроме РФ
			'ACUSDGTL', // USD worldwide (кроме РФ)
			'ACEURGTL', // EUR worldwide (кроме РФ)
			'ACBYNGTL', // Беларусь
			'ACUSDKB', // USD worldwide
			'ACEURKB' // EUR worldwide
		]
	}

	public async createPayment(payment: PaymentEntity, email: string) {
		const products = [
			{
				name: 'Премиум-доступ на 30 дней',
				price: payment.amount.value,
				quantity: 1
			}
		]

		const response = await this.prodamus.createPayment({
			sys: 'default',
			products,
			customer_email: email,
			order_id: payment.id,
			do: PaymentDo.PAY,
			available_payment_methods: this.INTERNATIONAL_METHODS.join('|'),
			urlSuccess: process.env.HOSTS_APP + '/payment/success',
			urlReturn: process.env.HOSTS_APP + '/payment/cancel',
			urlNotification: process.env.HOSTS_REST + '/webhook/prodamus'
		})

		return {
			id: randomBytes(16).toString('hex'),
			url: response.url,
			raw: response
		}
	}
}
