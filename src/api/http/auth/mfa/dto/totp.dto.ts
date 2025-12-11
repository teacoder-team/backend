import { ApiProperty } from '@nestjs/swagger'

export class TotpGenerateSecretResponse {
	@ApiProperty({
		description: 'QR code URL for TOTP setup',
		example: 'data:image/png;base64,...'
	})
	public qrCodeUrl: string

	@ApiProperty({
		description: 'TOTP secret key for generating one-time passwords',
		example: 'JBSWY3DPEHPK3PXP'
	})
	public secret: string
}
