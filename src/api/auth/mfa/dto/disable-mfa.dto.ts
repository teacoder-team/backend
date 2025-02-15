import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class DisableMfaDto {
	@IsString({ message: 'Пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Пароль обязателен для заполнения' })
	@MinLength(6, { message: 'Пароль должен содержать не менее 6 символов' })
	@MaxLength(128, {
		message: 'Пароль должен содержать не более 128 символов'
	})
	public password: string
}
