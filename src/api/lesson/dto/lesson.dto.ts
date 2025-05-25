import { ApiProperty } from '@nestjs/swagger'

import { CourseResponse } from '@/api/course/dto'

export class LessonResponse {
	@ApiProperty({
		description: 'Unique identifier',
		example: '550e8400-e29b-41d4-a716-446655440000'
	})
	public id: string

	@ApiProperty({
		description: 'Lesson title',
		example: 'Getting Started'
	})
	public title: string

	@ApiProperty({
		description: 'Unique lesson slug',
		example: 'getting-started'
	})
	public slug: string

	@ApiProperty({
		description: 'Lesson description',
		example: 'Introduction to NestJS and setup.'
	})
	public description: string

	@ApiProperty({
		description: 'Lesson position in course',
		example: 1
	})
	public position: number

	@ApiProperty({
		description: 'Kinescope video ID',
		example: 'UCSOW2TFUGL34ZWCOZSAHDFU4W'
	})
	public kinescopeId: string

	@ApiProperty({
		description: 'Is lesson published?',
		example: true
	})
	public isPublished: boolean

	@ApiProperty({
		description: 'Course the lesson belongs to',
		type: CourseResponse
	})
	public course: CourseResponse

	@ApiProperty({
		description: 'Course ID the lesson belongs to',
		example: '550e8400-e29b-41d4-a716-446655440000'
	})
	public courseId: string

	@ApiProperty({
		description: 'Lesson creation date',
		example: '2025-02-19T12:00:00Z'
	})
	public createdAt: Date

	@ApiProperty({
		description: 'Lesson last update date',
		example: '2025-02-19T12:00:00Z'
	})
	public updatedAt: Date
}
