import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import {
	PaymentMethod,
	PaymentProvider,
	PaymentStatus
} from '@prisma/generated'
import { addMonths } from 'date-fns'
import { YookassaService } from 'nestjs-yookassa'

import { TeamanagerBotService } from '@/api/bots/teamanager/teamanager.bot.service'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { MailService } from '@/libs/mail/mail.service'

import { ProcessWebhookUseCase } from '../../application/use-cases/process-webhook.use-case'

import { HeleketPaymentWebhookResponse } from './dto/heleket-webhook.dto'
import { NormalizedCallbackDto } from './dto/normalized-callback.dto'
import { WebhookMapper } from './webhook.mapper'
import { WebhookValidator } from './webhook.validator'

@Injectable()
export class WebhookService {
	private readonly logger = new Logger(WebhookService.name)

	public constructor(
		private readonly processWebhookUseCase: ProcessWebhookUseCase,
		private readonly yookassaService: YookassaService,
		private readonly validator: WebhookValidator,
		private readonly mapper: WebhookMapper
	) {}

	public async handleYookassa(payload: any, ip: string) {
		this.logger.log(`➡️ Incoming YooKassa webhook: ${payload.event}`)
		this.validator.validateYooKassa(ip)

		if (payload.event === 'payment.waiting_for_capture') {
			this.logger.log(`Capturing YooKassa payment ${payload.object.id}`)
			await this.yookassaService.payments.capture(payload.object.id)
		}

		const normalized = this.mapper.fromYookassa(payload)
		await this.processWebhookUseCase.execute(normalized)
	}

	public async handleProdamus(payload: any, signature: string) {
		this.logger.log(
			`➡️ Incoming Prodamus webhook for order ${payload.order_num}`
		)

		this.validator.validateProdamus(
			payload,
			signature,
			process.env.PRODAMUS_SECRET_KEY!
		)

		this.logger.log(
			`Prodamus signature verified for order ${payload.order_num}`
		)

		const normalized = this.mapper.fromProdamus(payload)
		await this.processWebhookUseCase.execute(normalized)
	}

	public async handleHeleket(
		payload: HeleketPaymentWebhookResponse,
		ip: string
	) {
		this.logger.log(`➡️ Incoming Heleket webhook: ${payload.uuid}`)
		this.validator.validateHeleket(ip)

		const normalized = this.mapper.fromHeleket(payload)
		await this.processWebhookUseCase.execute(normalized)
	}
}
