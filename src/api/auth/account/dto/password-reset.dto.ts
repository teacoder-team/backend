import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class PasswordResetRequest {
	@ApiProperty({
		description: 'Reset token',
		example: 'abc123xyz'
	})
	@IsString({ message: 'Токен должен быть строкой' })
	@IsNotEmpty({ message: 'Токен обязателен для заполнения' })
	token: string

	@ApiProperty({
		description: 'New password',
		example: '123456',
		minLength: 6,
		maxLength: 128
	})
	@IsString({ message: 'Пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
	@MinLength(6, { message: 'Пароль должен содержать не менее 6 символов' })
	@MaxLength(128, {
		message: 'Пароль должен содержать не более 128 символов'
	})
	password: string
}
