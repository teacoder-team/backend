import { ApiProperty } from '@nestjs/swagger'

export class PublicKeyCredentialParameter {
	@ApiProperty({
		example: -7,
		description: 'Encryption algorithm'
	})
	public alg: number

	@ApiProperty({ example: 'public-key', description: 'Credential type' })
	public type: string
}

export class AuthenticatorSelection {
	@ApiProperty({
		example: 'preferred',
		description: 'Preferred resident key type'
	})
	public residentKey: string

	@ApiProperty({
		example: 'preferred',
		description: 'Required user verification level'
	})
	public userVerification: string

	@ApiProperty({
		example: false,
		description: 'Indicates whether a resident key is required'
	})
	public requireResidentKey: boolean
}

export class RpEntity {
	@ApiProperty({
		example: 'TeaCoder',
		description: 'Name of the relying party (the server)'
	})
	public name: string

	@ApiProperty({
		example: 'localhost',
		description: 'Identifier of the relying party (the server)'
	})
	public id: string
}

export class User {
	@ApiProperty({
		example: 'NGM5Y2UzNWQtYTE0Ni00MDJkLWJiOGUtMzQ2OGM3NThlN2Rm',
		description: 'Unique user ID'
	})
	public id: string

	@ApiProperty({
		example: 'john.doe@example.com',
		description: 'User email address'
	})
	public name: string

	@ApiProperty({ example: 'Vadim', description: 'User display name' })
	public displayName: string
}

export class ExtensionOptions {
	@ApiProperty({
		example: true,
		description: 'Whether to include credential properties in the response'
	})
	public credProps: boolean
}

export class GeneratePasskeyOptionsResponse {
	@ApiProperty({ description: 'Challenge string used for registration' })
	public challenge: string

	@ApiProperty({
		type: RpEntity,
		description: 'Information about the relying party (server)'
	})
	public rp: RpEntity

	@ApiProperty({
		type: User,
		description: 'Information about the user'
	})
	public user: User

	@ApiProperty({
		type: [PublicKeyCredentialParameter],
		description: 'List of supported public key credential parameters'
	})
	public pubKeyCredParams: PublicKeyCredentialParameter[]

	@ApiProperty({
		example: 60000,
		description: 'Timeout in milliseconds for the registration operation'
	})
	public timeout: number

	@ApiProperty({ example: 'none', description: 'Requested attestation type' })
	public attestation: string

	@ApiProperty({
		type: [Object],
		description: 'List of credentials to exclude (usually empty)'
	})
	public excludeCredentials: object[]

	@ApiProperty({
		type: AuthenticatorSelection,
		description: 'Authenticator selection criteria'
	})
	public authenticatorSelection: AuthenticatorSelection

	@ApiProperty({
		type: ExtensionOptions,
		description: 'WebAuthn extensions for additional capabilities'
	})
	public extensions: ExtensionOptions

	@ApiProperty({
		type: [String],
		description: 'Hints or recommendations (usually empty)'
	})
	public hints: string[]
}
