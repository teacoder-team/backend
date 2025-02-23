import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CreateLessonRequest {
	@ApiProperty({
		description: 'Lesson title',
		example: 'Introduction to TypeScript'
	})
	@IsString({ message: 'Название урока должно быть строкой' })
	@IsNotEmpty({ message: 'Название урока обязательно для заполнения' })
	@MaxLength(255, {
		message: 'Название урока не должно превышать 255 символов'
	})
	public title: string

	@ApiProperty({
		description: 'Course ID to which the lesson belongs',
		example: '550e8400-e29b-41d4-a716-446655440000'
	})
	@IsString({ message: 'Идентификатор курса должен быть строкой' })
	@IsNotEmpty({ message: 'Идентификатор курса обязателен для заполнения' })
	public courseId: string
}

export class CreateLessonResponse {
	@ApiProperty({
		description: 'Unique lesson identifier',
		example: '550e8400-e29b-41d4-a716-446655440001'
	})
	public id: string
}
