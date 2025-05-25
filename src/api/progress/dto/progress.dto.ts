import { ApiProperty } from '@nestjs/swagger'
import type { UserProgress } from '@prisma/generated'

export class ProgressResponse implements UserProgress {
	@ApiProperty({
		description: 'Unique identifier',
		example: '550e8400-e29b-41d4-a716-446655440000'
	})
	public id: string

	@ApiProperty({
		description: 'Indicates whether the lesson is completed',
		example: true
	})
	public isCompleted: boolean

	@ApiProperty({
		description: 'User ID associated with the progress',
		example: '550e8400-e29b-41d4-a716-446655440001'
	})
	public userId: string

	@ApiProperty({
		description: 'Lesson ID associated with the progress',
		example: '550e8400-e29b-41d4-a716-446655440002'
	})
	public lessonId: string

	@ApiProperty({
		description: 'Date when the progress was created',
		example: '2025-02-19T12:00:00Z'
	})
	public createdAt: Date

	@ApiProperty({
		description: 'Date when the progress was last updated',
		example: '2025-02-19T12:00:00Z'
	})
	public updatedAt: Date
}
