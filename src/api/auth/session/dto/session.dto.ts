import { ApiProperty } from '@nestjs/swagger'

export class SessionResponse {
	@ApiProperty({
		description: 'Unique identifier',
		example: '550e8400-e29b-41d4-a716-446655440000'
	})
	public id: string

	@ApiProperty({
		description: 'Date and time when the session was created',
		example: '2024-02-19T12:34:56.789Z'
	})
	public createdAt: Date

	@ApiProperty({
		description: 'Country from which the login occurred',
		example: 'United States'
	})
	public country: string

	@ApiProperty({
		description: 'City from which the login occurred',
		example: 'New York'
	})
	public city: string

	@ApiProperty({
		description: 'Name of the browser used',
		example: 'Google Chrome'
	})
	public browser: string

	@ApiProperty({
		description: 'Operating system of the user',
		example: 'Windows 11'
	})
	public os: string
}
