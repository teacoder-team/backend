import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength
} from 'class-validator'

export class LoginDto {
	@IsString({ message: 'Электронная почта должна быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат электронной почты' })
	@IsNotEmpty({ message: 'Электронная почта обязательна для заполнения' })
	public email: string

	@IsString({ message: 'Пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Поле пароль не может быть пустым' })
	@MinLength(6, {
		message: 'Пароль должен содержать не менее 6 символов'
	})
	@MaxLength(128, {
		message: 'Пароль должен содержать не более 128 символов'
	})
	public password: string
}
