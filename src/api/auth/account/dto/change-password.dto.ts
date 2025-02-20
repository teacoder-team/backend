import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class ChangePasswordRequest {
	@ApiProperty({
		description: 'Current password',
		example: '123456',
		minLength: 6,
		maxLength: 128
	})
	@IsString({ message: 'Текущий пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Текущий пароль не может быть пустым' })
	@MinLength(6, {
		message: 'Текущий пароль должен содержать не менее 6 символов'
	})
	@MaxLength(128, {
		message: 'Текущий пароль должен содержать не более 128 символов'
	})
	public currentPassword: string

	@ApiProperty({
		description: 'New password',
		example: '123456',
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
