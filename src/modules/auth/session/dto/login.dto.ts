import { ApiProperty } from '@nestjs/swagger'
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	Length,
	MaxLength,
	MinLength
} from 'class-validator'

export class LoginDto {
	@ApiProperty({
		example: 'john.doe@example.com',
		description: 'Электронная почта пользователя',
		required: true
	})
	@IsString({ message: 'Электронная почта должна быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат электронной почты' })
	@IsNotEmpty({ message: 'Электронная почта обязательна для заполнения' })
	public email: string

	@ApiProperty({
		example: '123456',
		description: 'Пароль пользователя (от 6 до 128 символов)',
		required: true,
		minLength: 6,
		maxLength: 128
	})
	@IsString({ message: 'Пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Поле пароль не может быть пустым' })
	@MinLength(6, {
		message: 'Пароль должен содержать не менее 6 символов'
	})
	@MaxLength(128, {
		message: 'Пароль должен содержать не более 128 символов'
	})
	public password: string

	@ApiProperty({
		example: '123456',
		description: 'PIN-код для TOTP аутентификации (6 цифр)',
		required: false,
		minLength: 6,
		maxLength: 6
	})
	@IsString({ message: 'PIN-код должен быть строкой' })
	@IsOptional()
	@Length(6, 6, { message: 'PIN-код должен состоять из 6 цифр' })
	public pin?: string
}
