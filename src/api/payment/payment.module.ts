import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { YookassaModule } from 'nestjs-yookassa'

import {
	getHeleketConfig,
	getProdamusConfig,
	getYookassaConfig
} from '@/config'
import { HeleketModule } from '@/libs/heleket/heleket.module'
import { ProdamusModule } from '@/libs/prodamus/prodamus.module'

import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { SchedulerModule } from './scheduler/scheduler.module'
import { WebhookModule } from './webhook/webhook.module'

@Module({
	imports: [
		YookassaModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getYookassaConfig,
			inject: [ConfigService]
		}),
		ProdamusModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getProdamusConfig,
			inject: [ConfigService]
		}),
		HeleketModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: getHeleketConfig,
			inject: [ConfigService]
		}),
		WebhookModule,
		SchedulerModule
	],
	controllers: [PaymentController],
	providers: [PaymentService]
})
export class PaymentModule {}
