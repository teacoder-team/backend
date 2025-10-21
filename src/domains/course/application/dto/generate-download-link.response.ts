import { ApiProperty } from '@nestjs/swagger'

export class GenerateDownloadLinkResponse {
	@ApiProperty({
		description: 'URL to download the course',
		example: 'https://example.com/download/abc123'
	})
	public url: string
}
