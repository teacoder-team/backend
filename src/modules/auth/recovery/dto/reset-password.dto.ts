import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class ResetPasswordDto {
	@ApiProperty({
		example: 'john.doe@example.com',
		description: 'Электронная почта пользователя для сброса пароля',
		required: true
	})
	@IsString({ message: 'Электронная почта должна быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат электронной почты' })
	@IsNotEmpty({ message: 'Электронная почта обязательна для заполнения' })
	public email: string
}
