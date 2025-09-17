import { ApiProperty } from '@nestjs/swagger'
import { PaymentMethod } from '@prisma/generated'
import { IsEnum } from 'class-validator'

export class InitPaymentRequest {
	@ApiProperty({
		enum: PaymentMethod
	})
	@IsEnum(PaymentMethod)
	public method: PaymentMethod
}
