import { ApiProperty } from '@nestjs/swagger'
import {
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength
} from 'class-validator'

import { LoginSessionResponse } from '../../session/dto'

export class CreateUserRequest {
	@ApiProperty({
		description: 'Display name',
		example: 'John Doe'
	})
	@IsString({ message: 'Имя должно быть строкой' })
	@IsNotEmpty({ message: 'Имя обязательно для заполнения' })
	@MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
	public name: string

	@ApiProperty({
		description: 'Email address',
		example: 'john.doe@example.com'
	})
	@IsString({ message: 'Электронная почта должна быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат электронной почты' })
	@IsNotEmpty({ message: 'Электронная почта обязательна для заполнения' })
	public email: string

	@ApiProperty({
		description: 'Password',
		example: '123456',
		minLength: 6,
		maxLength: 128
	})
	@IsString({ message: 'Пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
	@MinLength(6, {
		message: 'Пароль должен содержать не менее 6 символов'
	})
	@MaxLength(128, {
		message: 'Пароль должен содержать не более 128 символов'
	})
	public password: string

	@ApiProperty({
		description: 'Captcha verification code',
		example: '03AFcWeA...'
	})
	@IsString({ message: 'Капча должна быть строкой' })
	@IsNotEmpty({ message: 'Капча обязательна' })
	public captcha: string

	@ApiProperty({
		description: 'Fingerprint visitor ID',
		example: 'g8GhE1JtVZ9xYkLm',
		required: false
	})
	@IsString({ message: 'visitorId должен быть строкой' })
	@IsOptional()
	public visitorId?: string

	@ApiProperty({
		description: 'Fingerprint request ID',
		example: 'dbe7b3b8-22f4-4b89-9db9-f8e3798a2b1e',
		required: false
	})
	@IsString({ message: 'requestId должен быть строкой' })
	@IsOptional()
	public requestId?: string
}

export class CreateUserResponse extends LoginSessionResponse {}
