import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiHeader } from '@nestjs/swagger'
import type { User } from '@prisma/generated'

import { Authorization, Authorized } from '@/common/decorators'

import { InitPaymentRequest } from './dto'
import { PaymentService } from './payment.service'

@Controller('payment')
export class PaymentController {
	public constructor(private readonly paymentService: PaymentService) {}

	@ApiHeader({
		name: 'X-Session-Token'
	})
	@Authorization()
	@Post('init')
	@HttpCode(HttpStatus.OK)
	public async init(
		@Body() dto: InitPaymentRequest,
		@Authorized() user: User
	) {
		return await this.paymentService.create(dto, user)
	}

	@Post('webhook')
	@HttpCode(HttpStatus.OK)
	public async webhook(@Body() dto: any) {
		console.log('PAYMENT WEBHOOK: ', dto)

		return dto
	}
}
