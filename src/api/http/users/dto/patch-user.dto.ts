import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class PatchUserRequest {
	@ApiProperty({
		description: 'Display name',
		example: 'John Doe'
	})
	@IsString({ message: 'Имя должно быть строкой' })
	@IsNotEmpty({ message: 'Имя обязательно для заполнения' })
	@MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
	public displayName: string
}
