import { Module } from '@nestjs/common'

import { TeamanagerBotModule } from '@/bots/teamanager/teamanager.bot.module'

import { WebhookController } from './webhook.controller'
import { WebhookService } from './webhook.service'
import { WebhookValidator } from './webhook.validator'

@Module({
	imports: [TeamanagerBotModule],
	controllers: [WebhookController],
	providers: [WebhookService, WebhookValidator]
})
export class WebhookModule {}
