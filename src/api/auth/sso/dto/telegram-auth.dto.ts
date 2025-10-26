import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString } from 'class-validator'

import { LoginSessionResponse } from '../../session/dto'

export class TelegramAuthRequest {
	@ApiProperty({
		description: 'Telegram user ID',
		example: 123456789
	})
	@IsInt()
	public id: number

	@ApiProperty({
		description: 'First name of the Telegram user',
		example: 'John'
	})
	@IsString()
	public first_name: string

	@ApiProperty({
		description: 'Last name of the Telegram user',
		example: 'Doe',
		required: false
	})
	@IsOptional()
	@IsString()
	public last_name?: string

	@ApiProperty({
		description: 'Username of the Telegram user',
		example: 'johndoe',
		required: false
	})
	@IsOptional()
	@IsString()
	public username?: string

	@ApiProperty({
		description: "URL to the user's profile photo",
		example: 'https://t.me/i/userpic/320/johndoe.jpg',
		required: false
	})
	@IsOptional()
	@IsString()
	public photo_url?: string

	@ApiProperty({
		description: 'Authentication date in UNIX timestamp',
		example: 1678886400
	})
	@IsInt()
	public auth_date: number

	@ApiProperty({
		description: 'Hash for validating the data integrity',
		example:
			'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
	})
	@IsString()
	public hash: string
}

export class TelegramAuthResponse extends LoginSessionResponse {}
