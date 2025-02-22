import { ApiProperty } from '@nestjs/swagger'
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength
} from 'class-validator'

import { Session } from '@/common/interfaces'

export class LoginRequest {
	@IsString({ message: 'Электронная почта должна быть строкой' })
	@IsEmail({}, { message: 'Некорректный формат электронной почты' })
	@IsNotEmpty({ message: 'Электронная почта обязательна для заполнения' })
	public email: string

	@IsString({ message: 'Пароль должен быть строкой' })
	@IsNotEmpty({ message: 'Поле пароль не может быть пустым' })
	@MinLength(6, {
		message: 'Пароль должен содержать не менее 6 символов'
	})
	@MaxLength(128, {
		message: 'Пароль должен содержать не более 128 символов'
	})
	public password: string
}

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

export class LoginSessionResponse implements Session {
	@ApiProperty({
		description: 'Unique session identifier',
		example: '550e8400-e29b-41d4-a716-446655440000'
	})
	public id: string

	@ApiProperty({
		description: 'Session token',
		example:
			'261527f4958ee90eb3ff34ba59154f468c241b0f026340d38c882d70b1b18eb3d7128c9e7d085e76'
	})
	public token: string

	@ApiProperty({
		description: 'Unique user identifier',
		example: '08a96e4b-7b23-4e65-a23f-49a6f2e5d8f1'
	})
	public userId: string
}

export class LoginMfaResponse {
	@ApiProperty({
		description: 'MFA ticket for further verification',
		example: 'bff74763b7697eb38664d28a41937a2887648a2f'
	})
	public ticket: string

	@ApiProperty({
		description: 'Allowed MFA methods',
		example: ['Totp', 'Recovery']
	})
	public allowedMethods: string[]

	@ApiProperty({
		description: 'Unique user identifier',
		example: '84ac0c40-dc6e-4df0-b7bf-9df220fd994a'
	})
	public userId: string
}
