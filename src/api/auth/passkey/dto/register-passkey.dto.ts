import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
	ArrayNotEmpty,
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsObject,
	IsOptional,
	IsString,
	MaxLength,
	ValidateNested
} from 'class-validator'

export class AuthenticationExtensionsClientOutputsDto {
	@ApiProperty({ description: 'App ID extension', required: false })
	@IsOptional()
	public appid?: boolean

	@ApiProperty({
		description: 'Credential properties output',
		required: false
	})
	@IsOptional()
	@IsObject()
	public credProps?: Record<string, any>

	@ApiProperty({
		description: 'HMAC create secret extension',
		required: false
	})
	@IsOptional()
	public hmacCreateSecret?: boolean
}

export enum AuthenticatorAttachmentEnum {
	CROSS_PLATFORM = 'cross-platform',
	PLATFORM = 'platform'
}

export class AuthenticatorAttestationResponseJSONDto {
	@ApiProperty({ description: 'Base64URL client data JSON' })
	@IsString()
	public clientDataJSON: string

	@ApiProperty({ description: 'Base64URL attestation object' })
	@IsString()
	public attestationObject: string

	@ApiProperty({
		description: 'Base64URL authenticator data',
		required: false
	})
	@IsOptional()
	@IsString()
	public authenticatorData?: string

	@ApiProperty({
		description: 'Transports supported by authenticator',
		required: false,
		type: [String]
	})
	@IsOptional()
	public transports?: string[]

	@ApiProperty({
		description: 'Public key algorithm identifier',
		required: false
	})
	@IsOptional()
	public publicKeyAlgorithm?: number

	@ApiProperty({ description: 'Base64URL public key', required: false })
	@IsOptional()
	@IsString()
	public publicKey?: string
}

export enum PublicKeyCredentialTypeEnum {
	PUBLIC_KEY = 'public-key'
}

export class RegistrationResponseJSONDto {
	@ApiProperty({ description: 'Credential ID in Base64URL' })
	@IsString()
	public id: string

	@ApiProperty({ description: 'Raw credential ID in Base64URL' })
	@IsString()
	public rawId: string

	@ApiProperty({ description: 'Authenticator attestation response' })
	@ValidateNested()
	@Type(() => AuthenticatorAttestationResponseJSONDto)
	public response: AuthenticatorAttestationResponseJSONDto

	@ApiProperty({
		description: 'Authenticator attachment type',
		required: false,
		enum: AuthenticatorAttachmentEnum
	})
	@IsOptional()
	@IsEnum(AuthenticatorAttachmentEnum)
	public authenticatorAttachment?: AuthenticatorAttachmentEnum

	@ApiProperty({ description: 'Client extension results' })
	@ValidateNested()
	@Type(() => AuthenticationExtensionsClientOutputsDto)
	public clientExtensionResults: AuthenticationExtensionsClientOutputsDto

	@ApiProperty({
		description: 'Public key credential type',
		enum: PublicKeyCredentialTypeEnum
	})
	@IsEnum(PublicKeyCredentialTypeEnum)
	public type: PublicKeyCredentialTypeEnum
}

export class RegisterPasskeyRequest {
	@ApiProperty({
		description: 'Name of the device used for registering the passkey',
		example: 'iPhone 13 Pro',
		maxLength: 50
	})
	@IsString({ message: 'Название устройства должено быть строкой' })
	@IsNotEmpty({ message: 'Название устройства обязателено для заполнения' })
	@MaxLength(50, {
		message: 'Название устройства не должено превышать 100 символов'
	})
	public deviceName: string

	@ApiProperty({
		description: 'Credential object returned by client for registration',
		type: 'object',
		additionalProperties: true
	})
	@IsObject()
	@IsNotEmpty()
	public credential: RegistrationResponseJSONDto

	@ApiProperty({
		description: 'List of supported transport methods for the passkey',
		example: ['usb', 'nfc', 'ble'],
		type: [String]
	})
	@IsArray({ message: 'Transports должны быть массивом' })
	@ArrayNotEmpty({ message: 'Transports не могут быть пустыми' })
	public transports: string[]
}

export class RegisterPasskeyResponse {
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
		description: 'List of supported transport methods for the passkey',
		example: ['usb', 'nfc', 'ble'],
		type: [String]
	})
	public transports: string[]
}
