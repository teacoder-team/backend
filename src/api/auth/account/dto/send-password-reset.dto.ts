import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class SendPasswordResetDto {
	@IsString({ message: 'Электронная почта должна быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат электронной почты' })
	@IsNotEmpty({ message: 'Электронная почта обязательна для заполнения' })
	email: string
}
