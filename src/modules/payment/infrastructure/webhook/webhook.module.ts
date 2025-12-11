import { Module } from '@nestjs/common'

import { TeamanagerBotModule } from '@/api/bots/teamanager/teamanager.bot.module'

import { WebhookController } from './webhook.controller'
import { WebhookMapper } from './webhook.mapper'
import { WebhookService } from './webhook.service'
import { WebhookValidator } from './webhook.validator'

@Module({
	imports: [TeamanagerBotModule],
	controllers: [WebhookController],
	providers: [WebhookService, WebhookValidator, WebhookMapper]
})
export class WebhookModule {}
