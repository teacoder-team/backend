import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post
} from '@nestjs/common'
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger'
import type { User } from '@prisma/generated'

import { Authorization, Authorized } from '@/shared/decorators'

import {
	InitPaymentRequest,
	InitPaymentResponse,
	PaymentMethodResponse
} from './dto'
import { PaymentService } from './payment.service'

@Controller('payment')
export class PaymentController {
	public constructor(private readonly paymentService: PaymentService) {}

	@ApiOperation({
		summary: 'Get available payment methods',
		description:
			'Returns a list of available payment methods based on the user’s country and platform configuration.'
	})
	@ApiOkResponse({
		type: [PaymentMethodResponse]
	})
	@Get('methods')
	@HttpCode(HttpStatus.OK)
	public async getAvailableMethods() {
		return await this.paymentService.getAvailableMethods()
	}

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
