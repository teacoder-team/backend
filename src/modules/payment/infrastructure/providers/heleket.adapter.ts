import { Injectable } from '@nestjs/common'

import { HeleketService } from '@/libs/heleket/heleket.service'

import { PaymentEntity } from '../../domain/entities/payment.entity'

import type { HeleketPort } from './heleket.port'

@Injectable()
export class HeleketAdapter implements HeleketPort {
	public constructor(private readonly heleket: HeleketService) {}

	public async createPayment(payment: PaymentEntity) {
		const response = await this.heleket.createPayment({
			order_id: payment.id,
			amount: payment.amount.value.toString(),
			currency: payment.amount.currency,
			url_return: process.env.HOSTS_APP + '/payment/success',
			url_success: process.env.HOSTS_APP + '/premium',
			url_callback: process.env.HOSTS_REST + '/webhook/heleket'
		})

		return {
			id: response.uuid,
			url: response.url,
			raw: response
		}
	}

	public verifyWebhook(ip: string, payload: any) {
		return this.heleket.verifyWebhook(ip, payload)
	}
}
