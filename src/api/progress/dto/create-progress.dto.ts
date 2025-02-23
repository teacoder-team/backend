import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class CreateProgressRequest {
	@ApiProperty({
		description: 'Indicates whether the lesson is completed',
		example: true
	})
	@IsBoolean({ message: 'Значение должно быть булевым (true/false)' })
	@IsNotEmpty({ message: 'Статус завершения урока обязателен' })
	public isCompleted: boolean

	@ApiProperty({
		description: 'Unique identifier of the lesson',
		example: '550e8400-e29b-41d4-a716-446655440000'
	})
	@IsString({ message: 'Идентификатор урока должен быть строкой' })
	@IsNotEmpty({ message: 'Идентификатор урока обязателен для заполнения' })
	public lessonId: string
}

export class CreateProgressResponse {
	@ApiProperty({
		description: 'Next lesson identifier or null if no next lesson exists',
		example: '550e8400-e29b-41d4-a716-446655440001',
		nullable: true
	})
	public nextLesson: string | null
}
