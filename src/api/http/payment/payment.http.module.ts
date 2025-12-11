import { Module } from '@nestjs/common'

import { PaymentModule } from '@/modules/payment/payment.module'

import { PaymentController } from './payment.controller'

@Module({
	imports: [PaymentModule],
	controllers: [PaymentController]
})
export class PaymentHttpModule {}
