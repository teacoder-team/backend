import { ApiProperty } from '@nestjs/swagger'

export class UserResponse {
	@ApiProperty({
		description: 'Unique identifier',
		example: '550e8400-e29b-41d4-a716-446655440000'
	})
	public id: string

	@ApiProperty({
		description: 'Account creation date',
		example: '2024-03-30T12:34:56.789Z'
	})
	public createdAt: Date

	@ApiProperty({
		description: 'Email address',
		example: 'john.doe@example.com'
	})
	public email: string

	@ApiProperty({
		description: 'Username',
		example: 'johndoe123'
	})
	public username: string

	@ApiProperty({
		description: 'Display name',
		example: 'John Doe'
	})
	public displayName: string

	@ApiProperty({
		description: 'Identifier of the user avatar',
		example: '5KYADI4YLYW3HCYIUDGLXNOC42',
		nullable: true
	})
	public avatar: string

	@ApiProperty({
		description: 'Indicates whether the user is banned',
		example: false
	})
	public isBanned: boolean

	@ApiProperty({
		description: 'Indicates whether multi-factor authentication is enabled',
		example: true
	})
	public isMfaEnabled: boolean
}
