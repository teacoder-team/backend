import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateCourseRequest {
	@ApiProperty({
		description: 'Title of the course',
		example: 'Introduction to NestJS'
	})
	@IsString({ message: 'Название должно быть строкой' })
	@IsNotEmpty({ message: 'Название обязательно для заполнения' })
	@MaxLength(100, { message: 'Название не должно превышать 100 символов' })
	public title: string
}
