import { ApiProperty } from '@nestjs/swagger'
import { PaymentMethod } from '@prisma/generated'
import { IsEmail, IsEnum, IsOptional } from 'class-validator'

export class InitPaymentRequest {
	@ApiProperty({
		description: 'Payment method',
		enum: PaymentMethod,
		example: PaymentMethod.BANK_CARD
	})
	@IsEnum(PaymentMethod)
	public method: PaymentMethod

	@ApiProperty({
		description: 'User email (required if the account does not have one)',
		example: 'john.doe@example.com',
		required: false
	})
	@IsEmail()
	@IsOptional()
	public email?: string
}

export class InitPaymentResponse {
	@ApiProperty({
		description: 'URL to complete the payment',
		example: 'https://yookassa.ru/redirect/123456'
	})
	public url: string
}
