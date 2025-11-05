import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Ip,
	Post
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { HeleketService } from '@/libs/heleket/heleket.service'
import { RobokassaService } from '@/libs/robokassa/robokassa.service'

import { HeleketPaymentWebhookResponse } from './dto'
import { WebhookService } from './webhook.service'

@Controller('webhook')
export class WebhookController {
	public constructor(
		private readonly webhookService: WebhookService,
		private readonly robokassaService: RobokassaService,
		private readonly heleketService: HeleketService
	) {}

	@ApiOperation({
		summary: 'Yookassa Webhook',
		description: 'Endpoint to receive Yookassa webhook events'
	})
	@ApiOkResponse({
		description: 'Webhook processed successfully',
		schema: {
			example: { ok: true }
		}
	})
	@Post('yookassa')
	@HttpCode(HttpStatus.OK)
	public async yookassa(@Body() payload: any, @Ip() ip: string) {
		this.webhookService.verifyWebhook(ip)

		await this.webhookService.handleYookassa(payload)

		return { ok: true }
	}

	@ApiOperation({
		summary: 'Robokassa Webhook',
		description: 'Endpoint to receive Robokassa payment notifications'
	})
	@ApiOkResponse({
		description: 'Webhook processed successfully',
		schema: {
			example: 'OK12345'
		}
	})
	@Post('robokassa')
	@HttpCode(HttpStatus.OK)
	public async robokassa(@Body() payload: any, @Ip() ip: string) {
		this.robokassaService.verifyWebhook(ip, payload)

		await this.webhookService.handleRobokassa(payload)

		return `OK${payload.InvId ?? payload.inv_id}`
	}

	@ApiOperation({
		summary: 'Heleket Webhook',
		description: 'Endpoint to receive Heleket crypto payment events'
	})
	@ApiOkResponse({
		description: 'Webhook processed successfully',
		schema: {
			example: { ok: true }
		}
	})
	@Post('heleket')
	@HttpCode(HttpStatus.OK)
	public async crypto(
		@Body() payload: HeleketPaymentWebhookResponse,
		@Ip() ip: string
	) {
		this.heleketService.verifyWebhook(ip, payload)

		await this.webhookService.handleCrypto(payload)

		return { ok: true }
	}
}
