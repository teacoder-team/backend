import { ApiProperty } from '@nestjs/swagger'
import { Course } from '@prisma/generated'

export class CourseResponse implements Course {
	@ApiProperty({
		description: 'Unique identifier',
		example: '550e8400-e29b-41d4-a716-446655440000'
	})
	public id: string

	@ApiProperty({
		description: 'Title of the course',
		example: 'Introduction to NestJS'
	})
	public title: string

	@ApiProperty({
		description: 'Slug of the course (unique URL identifier)',
		example: 'introduction-to-nestjs'
	})
	public slug: string

	@ApiProperty({
		description: 'Short description of the course',
		example: 'Brief overview of NestJS fundamentals.',
		nullable: true
	})
	public shortDescription: string

	@ApiProperty({
		description: 'Full description of the course',
		example:
			'In this 11-hour course we will cover integration of payment systems, JWT auth, recurring payments, webhooks, and more.',
		nullable: true
	})
	public fullDescription: string

	@ApiProperty({
		description: 'Identifier of the course thumbnail',
		example: 'UCSOW2TFUGL34ZWCOZSAHDFU4W',
		nullable: true
	})
	public thumbnail: string

	@ApiProperty({
		description: 'YouTube URL for course content or trailer',
		example: 'https://youtube.com/example',
		nullable: true
	})
	public youtubeUrl: string

	@ApiProperty({
		description: 'Identifier for the course code repository',
		example: 'UCSOW2TFUGL34ZWCOZSAHDFU4W',
		nullable: true
	})
	public attachment: string

	@ApiProperty({
		description: 'Whether the course is published or not',
		example: true
	})
	public isPublished: boolean

	@ApiProperty({
		description: 'Number of views the course has',
		example: 12345
	})
	public views: number

	@ApiProperty({
		description: 'Date when the course was created',
		example: '2025-02-19T12:00:00Z'
	})
	public createdAt: Date

	@ApiProperty({
		description: 'Date when the course was last updated',
		example: '2025-02-19T12:00:00Z'
	})
	public updatedAt: Date

	@ApiProperty({
		description: 'Number of lessons in the course',
		example: 10
	})
	public lessons: number
}
