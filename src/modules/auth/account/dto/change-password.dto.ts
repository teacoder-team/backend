import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class ChangePasswordDto {
	@ApiProperty({
		example: '123456',
		description: 'Старый пароль пользователя',
		required: true
	})
	@IsString({ message: 'Старый пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Старый пароль не может быть пустым' })
	public oldPassword: string

	@ApiProperty({
		example: '123456',
		description: 'Новый пароль пользователя (от 6 до 128 символов)',
		required: true,
		minLength: 6,
		maxLength: 128
	})
	@IsString({ message: 'Новый пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Новый пароль не может быть пустым' })
	@MinLength(6, {
		message: 'Новый пароль должен содержать не менее 6 символов'
	})
	@MaxLength(128, {
		message: 'Новый пароль должен содержать не более 128 символов'
	})
	public newPassword: string
}
