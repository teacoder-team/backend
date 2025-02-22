import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class ConfirmDeletionRequest {
	@ApiProperty({
		description: 'Deletion token',
		example: 'abc123xyz'
	})
	@IsString({ message: 'Токен должен быть строкой' })
	@IsNotEmpty({ message: 'Токен обязателен для заполнения' })
	token: string
}
