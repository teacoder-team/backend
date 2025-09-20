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

import { WebhookService } from './webhook.service'

@Controller('webhook')
export class WebhookController {
	public constructor(
		private readonly webhookService: WebhookService,
		private readonly heleketService: HeleketService
	) {}

	@ApiOperation({
		summary: 'YooKassa Webhook',
		description: 'Endpoint to receive YooKassa webhook events.'
	})
	@ApiOkResponse({
		description: 'Webhook processed successfully',
		schema: {
			example: { ok: true }
		}
	})
	@Post('yookassa')
	@HttpCode(HttpStatus.OK)
	public async yookassaWebhook(@Body() payload: any, @Ip() ip: string) {
		this.webhookService.verifyWebhook(ip)

		await this.webhookService.handleYookassa(payload)

		return { ok: true }
	}

	@ApiOperation({
		summary: 'Heleket Webhook',
		description: 'Endpoint to receive Heleket crypto payment events.'
	})
	@ApiOkResponse({
		description: 'Webhook processed successfully',
		schema: {
			example: { ok: true }
		}
	})
	@Post('crypto')
	@HttpCode(HttpStatus.OK)
	public async cryptoWebhook(@Body() payload: any, @Ip() ip: string) {
		this.heleketService.verifyWebhook(ip, payload)

		await this.webhookService.handleCrypto(payload)

		return { ok: true }
	}
}
