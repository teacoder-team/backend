import { ApiProperty } from '@nestjs/swagger'
import { RestrictionReason } from '@prisma/generated'
import {
	IsDateString,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsUUID
} from 'class-validator'

export class CreateRestrictionRequest {
	@ApiProperty({
		description: 'Reason for banning the user',
		example: RestrictionReason.INAPPROPRIATE_USERNAME,
		enum: RestrictionReason
	})
	@IsEnum(RestrictionReason, { message: 'Неверная причина бана' })
	@IsNotEmpty({ message: 'Причина бана обязательна для заполнения' })
	public reason: RestrictionReason

	@ApiProperty({
		description:
			'Date until the ban is active. If not provided, the ban is indefinite',
		example: '2025-12-31T23:59:59.999Z',
		required: false
	})
	@IsOptional()
	@IsDateString({}, { message: 'Неверный формат даты окончания' })
	public until?: string

	@ApiProperty({
		description: 'ID of the user to be banned',
		example: 'b8a7f3b9-e1d6-47e7-a7d7-f25c67b8992b'
	})
	@IsUUID('4', { message: 'Некорректный формат UUID для userId' })
	@IsNotEmpty({
		message: 'Идентификатор пользователя обязателен для заполнения'
	})
	public userId: string
}
