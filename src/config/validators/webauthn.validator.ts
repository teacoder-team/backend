import { IsString } from 'class-validator'

export class WebAuthnValidator {
	@IsString()
	public WEBAUTHN_RP_NAME: string

	@IsString()
	public WEBAUTHN_RP_ID: string

	@IsString()
	public WEBAUTHN_ORIGIN: string
}
