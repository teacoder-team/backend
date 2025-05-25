import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class SendPasswordResetRequest {
	@ApiProperty({
		description: 'Email associated with the account',
		example: 'john.doe@example.com'
	})
	@IsString({ message: 'Электронная почта должна быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат электронной почты' })
	@IsNotEmpty({ message: 'Электронная почта обязательна для заполнения' })
	public email: string

	@ApiProperty({
		description: 'Captcha verification code',
		example: '03AFcWeA...'
	})
	@IsString({ message: 'Капча должна быть строкой' })
	@IsNotEmpty({ message: 'Капча обязательна' })
	public captcha: string
}
