import { ApiProperty } from '@nestjs/swagger'

export class CoursesResponse {
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
		description: 'Identifier of the course thumbnail',
		example: 'UCSOW2TFUGL34ZWCOZSAHDFU4W',
		nullable: true
	})
	public thumbnail: string

	@ApiProperty({
		description: 'Number of lessons in the course',
		example: 10
	})
	public lessons: number
}
