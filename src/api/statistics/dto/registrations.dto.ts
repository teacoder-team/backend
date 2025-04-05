import { ApiProperty } from '@nestjs/swagger'

export class RegistrationsResponse {
	@ApiProperty({
		description: 'Date of user registrations in YYYY-MM-DD format',
		example: '2024-04-01'
	})
	public date: string

	@ApiProperty({
		description: 'Number of users registered on the given date',
		example: 222
	})
	public users: number
}
