import { ApiProperty } from '@nestjs/swagger'

export class SsoConnectResponse {
	@ApiProperty({
		description:
			'The URL for authorization via the external provider (e.g., Google, GitHub)',
		example:
			'https://auth.example.com/oauth/authorize?client_id=xyz123&redirect_uri=https://example.com/callback'
	})
	public url: string
}
