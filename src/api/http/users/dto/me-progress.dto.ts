import { ApiProperty } from '@nestjs/swagger'

export class LastLessonResponse {
	@ApiProperty({
		description: 'Unique identifier',
		example: '550e8400-e29b-41d4-a716-446655440000'
	})
	public id: string

	@ApiProperty({
		description: 'Unique lesson slug',
		example: 'getting-started'
	})
	public slug: string

	@ApiProperty({
		description: 'Lesson position in course',
		example: 1
	})
	public position: number
}

export class MeProgressResponse {
	@ApiProperty({
		description: 'Уникальный идентификатор курса',
		example: 'course_123'
	})
	public id: string

	@ApiProperty({
		description: 'Название курса',
		example: 'Основы TypeScript'
	})
	public title: string

	@ApiProperty({
		description: 'Общее количество уроков в курсе',
		example: 20
	})
	public totalLessons: number

	@ApiProperty({
		description: 'Количество завершенных пользователем уроков',
		example: 5
	})
	public completedLessons: number

	@ApiProperty({
		description: 'Прогресс прохождения курса в процентах',
		example: 25
	})
	public progress: number

	@ApiProperty({
		description: 'Дата последнего прогресса в курсе (последний доступ)',
		example: '2023-05-15T12:00:00.000Z'
	})
	public lastAccessed: string

	@ApiProperty({
		description: 'Последний просмотренный урок',
		type: LastLessonResponse,
		nullable: true
	})
	public lastLesson: LastLessonResponse | null
}
