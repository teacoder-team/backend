import { Module } from '@nestjs/common'

import { BotService } from '@/bot/bot.service'

import { WebhookController } from './webhook.controller'
import { WebhookService } from './webhook.service'

@Module({
	controllers: [WebhookController],
	providers: [WebhookService, BotService]
})
export class WebhookModule {}
