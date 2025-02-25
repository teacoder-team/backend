import { ApiProperty } from '@nestjs/swagger'

export class UserResponse {
	@ApiProperty({
		description: 'Unique identifier',
		example: '550e8400-e29b-41d4-a716-446655440000'
	})
	public id: string

	@ApiProperty({
		description: 'Display name',
		example: 'John Doe'
	})
	public displayName: string

	@ApiProperty({
		description: 'Email address',
		example: 'john.doe@example.com'
	})
	public email: string

	@ApiProperty({
		description: 'Identifier of the user avatar',
		example: 'UCSOW2TFUGL34ZWCOZSAHDFU4W'
	})
	public avatar: string
}
