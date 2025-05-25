import { ApiProperty } from '@nestjs/swagger'

export class LeaderResponse {
	@ApiProperty({
		description: 'Unique identifier of the user',
		example: '550e8400-e29b-41d4-a716-446655440000'
	})
	public id: string

	@ApiProperty({
		description: 'Display name of the user',
		example: 'John Doe'
	})
	public displayName: string

	@ApiProperty({
		description: 'User avatar URL or identifier',
		example: '5KYADI4YLYW3HCYIUDGLXNOC42'
	})
	public avatar: string

	@ApiProperty({
		description: 'Points accumulated by the user',
		example: 1500
	})
	public points: number
}
