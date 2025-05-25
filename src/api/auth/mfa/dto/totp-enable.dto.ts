import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class TotpEnableRequest {
	@ApiProperty({
		description: 'PIN code for enabling TOTP 2FA',
		example: '123456',
		minLength: 6,
		maxLength: 6
	})
	@IsString({ message: 'PIN должен быть строкой' })
	@IsNotEmpty({ message: 'PIN обязателен для заполнения' })
	@MinLength(6, { message: 'PIN должен содержать 6 символов' })
	@MaxLength(6, { message: 'PIN должен содержать не более 6 символов' })
	public pin: string

	@ApiProperty({
		description: 'TOTP secret key',
		example: 'JBSWY3DPEHPK3PXP'
	})
	@IsString({ message: 'Секрет должен быть строкой' })
	@IsNotEmpty({ message: 'Секрет обязателен для заполнения' })
	public secret: string
}
