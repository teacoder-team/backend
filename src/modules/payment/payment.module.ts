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

import { GetAvailableMethodsUseCase } from './application/use-cases/get-available-methods.use-case'
import { InitPaymentUseCase } from './application/use-cases/init-payment.use-case'
import { PaymentRepositoryPort } from './domain/repositories/payment.repository.port'
import { ReceiptRepositoryPort } from './domain/repositories/receipt.repository.port'
import { HeleketAdapter } from './infrastructure/providers/heleket.adapter'
import { HeleketPort } from './infrastructure/providers/heleket.port'
import { ProdamusAdapter } from './infrastructure/providers/prodamus.adapter'
import { ProdamusPort } from './infrastructure/providers/prodamus.port'
import { YookassaAdapter } from './infrastructure/providers/yookassa.adapter'
import { YookassaPort } from './infrastructure/providers/yookassa.port'
import { PaymentRepositoryAdapter } from './infrastructure/repositories/payment.repository.adapter'
import { ReceiptRepositoryAdapter } from './infrastructure/repositories/receipt.repository.adapter'

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
		})
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
		GetAvailableMethodsUseCase,
		InitPaymentUseCase,
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
		// ProdamusPort
	],
	exports: [GetAvailableMethodsUseCase, InitPaymentUseCase]
})
export class PaymentModule {}
