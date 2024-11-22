import { ApiProperty } from '@nestjs/swagger'
import {
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength,
	Validate
} from 'class-validator'

import { IsPasswordsMatchingConstraint } from '@/shared/decorators/is-passwords-matching-constraint.decorator'

export class NewPasswordDto {
	@ApiProperty({
		example: 'newpassword123',
		description: 'Новый пароль пользователя (от 6 до 128 символов)',
		required: true,
		minLength: 6,
		maxLength: 128
	})
	@IsString({ message: 'Пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
	@MinLength(6, { message: 'Пароль должен содержать не менее 6 символов' })
	@MaxLength(128, {
		message: 'Пароль должен содержать не более 128 символов'
	})
	public password: string

	@ApiProperty({
		example: 'newpassword123',
		description: 'Повтор нового пароля для подтверждения',
		required: true,
		minLength: 6,
		maxLength: 128
	})
	@IsString({ message: 'Пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Повтор пароля обязателен для заполнения' })
	@MinLength(6, { message: 'Пароль должен содержать не менее 6 символов' })
	@MaxLength(128, {
		message: 'Пароль должен содержать не более 128 символов'
	})
	@Validate(IsPasswordsMatchingConstraint, {
		message: 'Пароли не совпадают'
	})
	public passwordRepeat: string
}
