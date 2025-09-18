import { ApiProperty } from '@nestjs/swagger'

export class SsoStatusResponse {
	@ApiProperty({
		description: 'Indicates whether the GitHub account is connected',
		example: true
	})
	public github: boolean

	@ApiProperty({
		description: 'Indicates whether the Google account is connected',
		example: false
	})
	public google: boolean
}
