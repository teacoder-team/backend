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

import {
	InitPaymentRequest,
	InitPaymentResponse
} from '@/modules/payment/application/dto/init-payment.dto'
import { PaymentMethodResponse } from '@/modules/payment/application/dto/payment-method.dto'
import { GetAvailableMethodsUseCase } from '@/modules/payment/application/use-cases/get-available-methods.use-case'
import { InitPaymentUseCase } from '@/modules/payment/application/use-cases/init-payment.use-case'
import { Authorization, Authorized, ClientIp } from '@/shared/decorators'

@Controller('payment')
export class PaymentController {
	public constructor(
		private readonly getAvailableMethods: GetAvailableMethodsUseCase,
		private readonly initPayment: InitPaymentUseCase
	) {}

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
	public async getMethods(@ClientIp() ip: string) {
		return this.getAvailableMethods.execute(ip)
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
		return this.initPayment.execute({ user, method: dto.method })
	}
}
