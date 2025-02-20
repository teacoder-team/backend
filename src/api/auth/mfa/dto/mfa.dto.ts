import { ApiProperty } from '@nestjs/swagger'

export class MfaStatusResponse {
	@ApiProperty({
		description: 'Indicates if TOTP MFA is enabled for the account',
		example: true
	})
	public totpMfa: boolean

	@ApiProperty({
		description: 'Indicates if Passkey MFA is enabled for the account',
		example: false
	})
	public passkeyMfa: boolean

	@ApiProperty({
		description: 'Indicates if recovery codes are active for the account',
		example: true
	})
	public recoveryActive: boolean
}
