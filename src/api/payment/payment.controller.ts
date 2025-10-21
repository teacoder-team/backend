import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import type { User } from '@prisma/generated'

import { Authorization, Authorized } from '@/shared/decorators'

import { InitPaymentRequest, InitPaymentResponse } from './dto'
import { PaymentService } from './payment.service'

@Controller('payment')
export class PaymentController {
	public constructor(private readonly paymentService: PaymentService) {}

	@ApiOperation({
		summary: 'Init Payment',
		description:
			'Creates a new payment and returns a URL to complete the payment process.'
	})
	@ApiOkResponse({
		type: InitPaymentResponse
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
}
