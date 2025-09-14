import { ApiProperty } from '@nestjs/swagger'

export class PasskeyResponse {
	@ApiProperty({
		description: 'Unique identifier',
		example: 'd1f2a0b3-1f4e-4d7d-92b0-3d5a6f7c8d9a'
	})
	public id: string

	@ApiProperty({
		description: 'Name of the device associated with the passkey',
		example: 'iPhone 13 Pro'
	})
	public deviceName: string

	@ApiProperty({
		description: 'Timestamp of the last time the user accessed the device',
		example: '2025-05-09T14:45:00.000Z'
	})
	public lastUsedAt: Date

	@ApiProperty({
		description: 'Timestamp when the passkey was created',
		example: '2025-05-01T08:30:00.000Z'
	})
	public createdAt: Date
}
