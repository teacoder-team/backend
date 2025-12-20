import {
	Body,
	Controller,
	Headers,
	HttpCode,
	HttpStatus,
	Ip,
	Post
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'

import { HeleketService } from '@/libs/heleket/heleket.service'
import { ProdamusService } from '@/libs/prodamus/prodamus.service'

import { HeleketPaymentWebhookResponse } from './dto'
import { WebhookService } from './webhook.service'

@Controller('webhook')
export class WebhookController {
	public constructor(
		private readonly webhookService: WebhookService,
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
		await this.webhookService.handleYookassa(payload, ip)

		return { ok: true }
	}

	@ApiOperation({
		summary: 'Prodamus Webhook',
		description: 'Endpoint to receive Prodamus payment notifications'
	})
	@ApiOkResponse({
		description: 'Webhook processed successfully',
		schema: {
			example: { ok: true }
		}
	})
	@Post('prodamus')
	@HttpCode(HttpStatus.OK)
	public async prodamus(@Body() payload: any, @Headers('sign') sign: string) {
		await this.webhookService.handleProdamus(payload, sign)

		return { ok: true }
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
		await this.webhookService.handleCrypto(payload, ip)

		return { ok: true }
	}
}
