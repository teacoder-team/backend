import { ApiProperty } from '@nestjs/swagger'

export class MeStatisticsResponse {
	@ApiProperty({
		description: 'Общее количество очков пользователя',
		example: 1200
	})
	public totalPoints: number

	@ApiProperty({
		description:
			'Место пользователя в рейтинге (чем меньше число, тем выше пользователь)',
		example: 5
	})
	public ranking: number

	@ApiProperty({
		description:
			'Количество завершенных уроков и общее количество уроков (в формате X/Y)',
		example: '12/50'
	})
	public lessonsCompleted: string

	@ApiProperty({
		description: 'Прогресс обучения в процентах',
		example: 24
	})
	public learningProgressPercentage: number

	@ApiProperty({
		description:
			'Количество завершенных курсов (в которых пройдены все уроки)',
		example: 3
	})
	public completedCourses: number

	@ApiProperty({
		description:
			'Количество курсов, которые находятся в процессе изучения (но еще не завершены)',
		example: 2
	})
	public coursesInProgress: number
}
