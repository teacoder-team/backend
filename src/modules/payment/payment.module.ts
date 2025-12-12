import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { YookassaModule } from 'nestjs-yookassa'

import { TeamanagerBotModule } from '@/api/bots/teamanager/teamanager.bot.module'
import {
	getHeleketConfig,
	getProdamusConfig,
	getYookassaConfig
} from '@/config'
import { HeleketModule } from '@/libs/heleket/heleket.module'
import { ProdamusModule } from '@/libs/prodamus/prodamus.module'

import { GetAvailableMethodsUseCase } from './application/use-cases/get-available-methods.use-case'
import { InitPaymentUseCase } from './application/use-cases/init-payment.use-case'
import { ProcessWebhookUseCase } from './application/use-cases/process-webhook.use-case'
import { PaymentMethodRepositoryPort } from './domain/repositories/payment-method.repository.port'
import { PaymentNotifierPort } from './domain/repositories/payment-notifier.port'
import { PaymentRepositoryPort } from './domain/repositories/payment.repository.port'
import { ReceiptRepositoryPort } from './domain/repositories/receipt.repository.port'
import { SubscriptionRepositoryPort } from './domain/repositories/subscription.repository.port'
import { UserRepositoryPort } from './domain/repositories/user.repository.port'
import { PaymentNotifierAdapter } from './infrastructure/notifiers/payment-notifier.adapter'
import { HeleketAdapter } from './infrastructure/providers/heleket.adapter'
import { HeleketPort } from './infrastructure/providers/heleket.port'
import { ProdamusAdapter } from './infrastructure/providers/prodamus.adapter'
import { ProdamusPort } from './infrastructure/providers/prodamus.port'
import { YookassaAdapter } from './infrastructure/providers/yookassa.adapter'
import { YookassaPort } from './infrastructure/providers/yookassa.port'
import { PaymentMethodRepositoryAdapter } from './infrastructure/repositories/payment-method.repository.adapter'
import { PaymentRepositoryAdapter } from './infrastructure/repositories/payment.repository.adapter'
import { ReceiptRepositoryAdapter } from './infrastructure/repositories/receipt.repository.adapter'
import { SubscriptionRepositoryAdapter } from './infrastructure/repositories/subscription.repository.adapter'
import { UserRepositoryAdapter } from './infrastructure/repositories/user.repository.adapter'

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
		TeamanagerBotModule
	],
	providers: [
		{
			provide: PaymentRepositoryPort,
			useClass: PaymentRepositoryAdapter
		},
		{
			provide: ReceiptRepositoryPort,
			useClass: ReceiptRepositoryAdapter
		},
		{
			provide: SubscriptionRepositoryPort,
			useClass: SubscriptionRepositoryAdapter
		},
		{
			provide: UserRepositoryPort,
			useClass: UserRepositoryAdapter
		},
		{
			provide: PaymentMethodRepositoryPort,
			useClass: PaymentMethodRepositoryAdapter
		},
		{
			provide: PaymentNotifierPort,
			useClass: PaymentNotifierAdapter
		},
		GetAvailableMethodsUseCase,
		InitPaymentUseCase,
		ProcessWebhookUseCase,
		{
			provide: YookassaPort,
			useClass: YookassaAdapter
		},
		{
			provide: ProdamusPort,
			useClass: ProdamusAdapter
		},
		{
			provide: HeleketPort,
			useClass: HeleketAdapter
		}
	],
	exports: [
		GetAvailableMethodsUseCase,
		InitPaymentUseCase,
		ProcessWebhookUseCase,
		PaymentRepositoryPort,
		SubscriptionRepositoryPort,
		UserRepositoryPort,
		PaymentMethodRepositoryPort
	]
})
export class PaymentModule {}
