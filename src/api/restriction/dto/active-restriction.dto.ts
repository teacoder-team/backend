import { ApiProperty } from '@nestjs/swagger'
import { RestrictionReason } from '@prisma/generated'

export class ActiveRestrictionResponse {
	@ApiProperty({
		description: 'Date of restriction creation',
		example: '2025-03-29T12:34:56.789Z'
	})
	public createdAt: string

	@ApiProperty({
		description: 'Reason for the user restriction',
		example: RestrictionReason.SPAM
	})
	public reason: string

	@ApiProperty({
		description: 'End date of the restriction, if temporary',
		example: '2025-04-28',
		required: false
	})
	public until?: string

	@ApiProperty({
		description: 'Information on whether the ban is permanent',
		example: false
	})
	public isPermanent: boolean
}
