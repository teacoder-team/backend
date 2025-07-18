import { ApiProperty } from '@nestjs/swagger'
import {
	ArrayNotEmpty,
	IsArray,
	IsNotEmpty,
	IsString,
	MaxLength
} from 'class-validator'

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
		description: 'Unique credential ID for the passkey',
		example: 'abcd1234efgh5678ijkl',
		maxLength: 255
	})
	@IsString({ message: 'Credential ID должен быть строкой' })
	@IsNotEmpty({ message: 'Credential ID обязателен для заполнения' })
	public credentialId: string

	@ApiProperty({
		description: 'Public key for the passkey',
		example:
			'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1wA4P56FZP4Q2+Ld5uU5CqzTtW2n1SbxdTeQUjzkVgJtD0jvBZiFAxN1LRJ9fj2wzApoRqsEnnFF5z1gO5BrfEvztBlXijj7XSTK0CZGvNm5FCqIHxB5OeoDyz3BdoMvYFzkEF74ly7sEmZaEEDuWxrl7QhTkIVD+2aXYAZu/9RlfV6n0bNKylA==',
		maxLength: 2048
	})
	@IsString({ message: 'Публичный ключ должен быть строкой' })
	@IsNotEmpty({ message: 'Публичный ключ обязателен для заполнения' })
	@MaxLength(2048, {
		message: 'Публичный ключ не должен превышать 2048 символов'
	})
	public publicKey: string

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
