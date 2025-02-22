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

export class CreateCourseResponse {
	@ApiProperty({
		description: 'Unique identifier',
		example: 'd364587c-b690-43c5-8a7f-3c391eee5b97'
	})
	public id: string
}
