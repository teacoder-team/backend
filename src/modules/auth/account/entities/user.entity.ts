import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '@prisma/generated'

export class UserEntity {
	@ApiProperty({
		name: 'id',
		description: 'Уникальный идентификатор пользователя',
		example: 'f82a0b7d-3517-4f3b-b865-9e774d6bde76'
	})
	id: string

	@ApiProperty({
		name: 'email',
		description: 'Адрес электронной почты пользователя',
		example: 'user@example.com'
	})
	email: string

	@ApiProperty({
		name: 'password',
		description: 'Пароль пользователя',
		example: 'password123'
	})
	password: string

	@ApiProperty({
		name: 'username',
		description: 'Имя пользователя',
		example: 'user123'
	})
	username: string

	@ApiProperty({
		name: 'displayName',
		description: 'Отображаемое имя пользователя',
		example: 'Иван Иванов'
	})
	displayName: string

	@ApiProperty({
		name: 'picture',
		description: 'Ссылка на изображение профиля пользователя',
		example: 'https://example.com/avatar.jpg',
		required: false
	})
	picture?: string

	@ApiProperty({
		name: 'points',
		description: 'Количество очков пользователя',
		example: 150
	})
	points: number

	@ApiProperty({
		name: 'role',
		description: 'Роль пользователя',
		example: UserRole.STUDENT,
		enum: [UserRole]
	})
	role: UserRole

	@ApiProperty({
		name: 'isVerified',
		description: 'Статус подтверждения пользователя',
		example: false
	})
	isVerified: boolean

	@ApiProperty({
		name: 'isTotpEnabled',
		description: 'Статус включения двухфакторной аутентификации',
		example: false
	})
	isTotpEnabled: boolean

	@ApiProperty({
		name: 'totpSecret',
		description: 'Секретный ключ для двухфакторной аутентификации',
		example: 'totp_secret'
	})
	totpSecret: string

	@ApiProperty({
		name: 'createdAt',
		description: 'Дата и время создания учетной записи пользователя',
		example: '2024-11-09T10:00:00Z'
	})
	createdAt: Date

	@ApiProperty({
		name: 'updatedAt',
		description: 'Дата и время последнего обновления учетной записи',
		example: '2024-11-09T12:00:00Z'
	})
	updatedAt: Date
}
