import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type {
	Payment,
	Subscription,
	User,
	UserPaymentMethod
} from '@prisma/generated'
import { InjectBot } from 'nestjs-telegraf'
import { Telegraf } from 'telegraf'

import type { AllConfigs } from '@/config/definitions'
import { PrismaService } from '@/infra/prisma/prisma.service'

import { MESSAGES } from '../shared/messages'

@Injectable()
export class TeacoderBotService {
	private readonly OWNER_ID: string

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService<AllConfigs>,
		@InjectBot('teacoder') private readonly bot: Telegraf
	) {
		this.OWNER_ID = this.configService.get('telegram.ownerId', {
			infer: true
		})
	}
}
