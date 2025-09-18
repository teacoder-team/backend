import { ApiProperty } from '@nestjs/swagger'
import { PaymentMethod } from '@prisma/generated'
import { IsEnum } from 'class-validator'

export class InitPaymentRequest {
	@ApiProperty({
		description: 'Payment method',
		enum: PaymentMethod,
		example: PaymentMethod.BANK_CARD
	})
	@IsEnum(PaymentMethod)
	public method: PaymentMethod
}

export class InitPaymentResponse {
	@ApiProperty({
		description: 'URL to complete the payment',
		example: 'https://yookassa.ru/redirect/123456'
	})
	public url: string
}
