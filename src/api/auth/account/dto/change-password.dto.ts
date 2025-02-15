import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class ChangePasswordDto {
	@IsString({ message: 'Текущий пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Текущий пароль не может быть пустым' })
	@MinLength(6, {
		message: 'Текущий пароль должен содержать не менее 6 символов'
	})
	@MaxLength(128, {
		message: 'Текущий пароль должен содержать не более 128 символов'
	})
	public currentPassword: string

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
