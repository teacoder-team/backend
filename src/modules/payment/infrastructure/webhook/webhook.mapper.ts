import { Injectable, Logger } from '@nestjs/common'

import { HeleketPaymentWebhookResponse } from './dto/heleket-webhook.dto'
import { NormalizedCallbackDto } from './dto/normalized-callback.dto'

@Injectable()
export class WebhookMapper {
	private readonly logger = new Logger(WebhookMapper.name)

	public fromYookassa(payload: any): NormalizedCallbackDto {
		this.logger.debug(`Mapping YooKassa webhook: ${payload?.event}`)

		const result: NormalizedCallbackDto = {
			provider: 'yookassa',
			isSuccess: payload.event === 'payment.succeeded',
			paymentId: payload.object.metadata.payment_id,
			amount: payload.object.amount?.value,
			raw: payload
		}

		this.logger.debug(`Mapped YooKassa webhook: ${JSON.stringify(result)}`)

		return result
	}

	public fromProdamus(payload: any): NormalizedCallbackDto {
		this.logger.debug(
			`Mapping Prodamus webhook: status=${payload?.payment_status}, order_num=${payload?.order_num}`
		)

		const result: NormalizedCallbackDto = {
			provider: 'prodamus',
			isSuccess: payload.payment_status === 'success',
			paymentId: payload.order_num,
			amount: parseFloat(payload.sum),
			raw: payload
		}

		this.logger.debug(`Mapped Prodamus webhook: ${JSON.stringify(result)}`)

		return result
	}

	public fromHeleket(
		payload: HeleketPaymentWebhookResponse
	): NormalizedCallbackDto {
		this.logger.debug(`Mapping Heleket webhook: uuid=${payload.uuid}`)

		const result: NormalizedCallbackDto = {
			provider: 'heleket',
			isSuccess:
				payload.status === 'paid' || payload.status === 'paid_over',
			paymentId: payload.order_id,
			amount: payload.payer_amount,
			raw: payload
		}

		this.logger.debug(`Mapped Heleket webhook: ${JSON.stringify(result)}`)

		return result
	}
}
