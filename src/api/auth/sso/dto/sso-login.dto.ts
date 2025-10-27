import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class SsoLoginRequest {
	@ApiProperty({
		description: 'Visitor fingerprint ID',
		example: 'visitor-123456'
	})
	@IsOptional()
	@IsString()
	public visitorId?: string

	@ApiProperty({
		description: 'Request ID for fingerprint tracking',
		example: 'req-987654'
	})
	@IsOptional()
	@IsString()
	public requestId?: string
}

export class SsoLoginResponse {
	@ApiProperty({
		description:
			'The URL for authorization via the external provider (e.g., Google, GitHub)',
		example:
			'https://auth.example.com/oauth/authorize?client_id=xyz123&redirect_uri=https://example.com/callback'
	})
	public url: string
}
