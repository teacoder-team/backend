import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, Length } from 'class-validator'

export class EnableTotpDto {
	@ApiProperty({
		example: 'JBSWY3DPEHPK3PXP',
		description: 'Секретный ключ для TOTP аутентификации',
		required: true
	})
	@IsString({ message: 'Секретный ключ должен быть строкой' })
	@IsNotEmpty({ message: 'Секретный ключ не должен быть пустым' })
	public secret: string

	@ApiProperty({
		example: '123456',
		description: 'PIN-код для TOTP аутентификации (6 цифр)',
		required: true,
		minLength: 6,
		maxLength: 6
	})
	@IsString({ message: 'PIN-код должен быть строкой' })
	@IsNotEmpty({ message: 'PIN-код не должен быть пустым' })
	@Length(6, 6, { message: 'PIN-код должен состоять из 6 цифр' })
	public pin: string
}
