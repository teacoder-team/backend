import { Module } from '@nestjs/common'

import { PaymentModule } from '../../payment.module'

import { WebhookController } from './webhook.controller'
import { WebhookMapper } from './webhook.mapper'
import { WebhookService } from './webhook.service'
import { WebhookValidator } from './webhook.validator'

@Module({
	imports: [PaymentModule],
	controllers: [WebhookController],
	providers: [WebhookService, WebhookValidator, WebhookMapper]
})
export class WebhookModule {}
