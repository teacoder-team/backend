import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class MfaTotpRequest {
	@ApiProperty({
		description: 'MFA Ticket',
		example: 'aca7247545d1333e155cd9bc0d94f9a8f1a49859'
	})
	@IsString()
	@IsNotEmpty()
	public ticket: string

	@ApiProperty({
		description: '6-digit code from the authentication application',
		example: '123456',
		minLength: 6,
		maxLength: 6
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	@MaxLength(6)
	public totpCode: string
}

export class MfaRecoveryRequest {
	@ApiProperty({
		description: 'MFA Ticket',
		example: 'aca7247545d1333e155cd9bc0d94f9a8f1a49859'
	})
	@IsString()
	@IsNotEmpty()
	public ticket: string

	@ApiProperty({
		description: 'One of the recovery codes',
		example: '73e8d-67c78',
		minLength: 11,
		maxLength: 11
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(11)
	@MaxLength(11)
	public recoveryCode: string
}
