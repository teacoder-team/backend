import { Module } from '@nestjs/common'

import { TeamanagerBotModule } from '@/bots/teamanager/teamanager.bot.module'

import { WebhookController } from './webhook.controller'
import { WebhookService } from './webhook.service'

@Module({
	imports: [TeamanagerBotModule],
	controllers: [WebhookController],
	providers: [WebhookService]
})
export class WebhookModule {}
