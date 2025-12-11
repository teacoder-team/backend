import { ApiProperty } from '@nestjs/swagger'

export class StatisticsResponse {
	@ApiProperty({
		description: 'Total number of users',
		example: 1850
	})
	public users: number

	@ApiProperty({
		description: 'Total number of courses',
		example: 13
	})
	public courses: number

	@ApiProperty({
		description: 'Total number of views across all course',
		example: 24851
	})
	public views: number

	@ApiProperty({
		description: 'Total number of lessons',
		example: 134
	})
	public lessons: number
}
