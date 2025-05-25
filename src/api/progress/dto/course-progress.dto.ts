import { ApiProperty } from '@nestjs/swagger'

export class CourseProgressResponse {
	@ApiProperty({
		description: 'Total number of lessons in the course',
		example: 20
	})
	public totalLessons: number

	@ApiProperty({
		description: 'Number of lessons completed by the user',
		example: 5
	})
	public completedLessons: number

	@ApiProperty({
		description: 'User progress in the course as a percentage',
		example: 25
	})
	public progressPercentage: number
}
