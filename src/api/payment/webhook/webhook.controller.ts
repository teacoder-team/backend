import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'

import { ClientIp } from '@/common/decorators'

import { WebhookService } from './webhook.service'

@Controller('webhook')
export class WebhookController {
	public constructor(private readonly webhookService: WebhookService) {}

	@Post('yookassa')
	@HttpCode(HttpStatus.OK)
	public async yookassaWebhook(@Body() payload: any, @ClientIp() ip: string) {
		console.log('YOOKASSA WEBHOOK IP: ', ip)

		this.webhookService.verifyWebhook(ip)

		await this.webhookService.handleYookassa(payload)

		return { ok: true }
	}

	// @Post('crypto')
	// @HttpCode(HttpStatus.OK)
	// public async cryptoWebhook(@Body() payload: any) {
	// 	await this.webhookService.handleCrypto(payload)

	// 	return { ok: true }
	// }
}
