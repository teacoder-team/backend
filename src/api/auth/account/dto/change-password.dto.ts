import { ApiProperty } from '@nestjs/swagger'
import {
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength,
	ValidateIf
} from 'class-validator'

export class ChangePasswordRequest {
	@ApiProperty({
		description: 'New password',
		example: '654321',
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

	@ApiProperty({
		description: 'Confirmation of the new password',
		example: '654321',
		minLength: 6,
		maxLength: 128
	})
	@IsString({ message: 'Подтверждение пароля должно быть строкой' })
	@IsNotEmpty({ message: 'Подтверждение пароля не может быть пустым' })
	@MinLength(6, {
		message: 'Подтверждение пароля должно содержать не менее 6 символов'
	})
	@MaxLength(128, {
		message: 'Подтверждение пароля должно содержать не более 128 символов'
	})
	@ValidateIf(o => o.newPassword === o.confirmPassword, {
		message: 'Пароли не совпадают'
	})
	public confirmPassword: string
}
