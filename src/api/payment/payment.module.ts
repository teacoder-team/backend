import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { YookassaModule } from 'nestjs-yookassa'

import { getHeleketConfig, getYookassaConfig } from '@/config'
import { HeleketModule } from '@/libs/heleket/heleket.module'

import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { WebhookModule } from './webhook/webhook.module'

@Module({
	imports: [
		YookassaModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getYookassaConfig,
			inject: [ConfigService]
		}),
		HeleketModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getHeleketConfig,
			inject: [ConfigService]
		}),
		WebhookModule
	],
	controllers: [PaymentController],
	providers: [PaymentService]
})
export class PaymentModule {}
