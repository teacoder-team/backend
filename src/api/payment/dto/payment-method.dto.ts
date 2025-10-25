import { ApiProperty } from '@nestjs/swagger'
import { PaymentMethod } from '@prisma/generated'

export class PaymentMethodResponse {
	@ApiProperty({
		description: 'Unique identifier of the payment method',
		example: PaymentMethod.BANK_CARD,
		enum: PaymentMethod
	})
	public id: string

	@ApiProperty({
		description: 'Display name of the payment method',
		example: 'Bank card'
	})
	public name: string

	@ApiProperty({
		description: 'Description of the payment method',
		example: 'Payment using cards issued by Russian banks'
	})
	public description: string

	@ApiProperty({
		description:
			'Indicates whether this payment method is available for the user',
		example: true
	})
	public isAvailable: boolean
}
