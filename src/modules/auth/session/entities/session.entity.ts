import { ApiProperty } from '@nestjs/swagger'

export class SessionEntity {
	@ApiProperty({
		name: 'id',
		description: 'Уникальный идентификатор сессии',
		example: '2e5e3712-f577-413f-89a6-40165f24262c'
	})
	id: string

	@ApiProperty({
		name: 'createdAt',
		description: 'Дата и время создания сессии',
		example: '2024-11-09T10:00:00Z'
	})
	createdAt: Date

	@ApiProperty({
		name: 'country',
		description: 'Страна, из которой была создана сессия',
		example: 'Russia'
	})
	country: string

	@ApiProperty({
		name: 'city',
		description: 'Город, из которого была создана сессия',
		example: 'Moscow'
	})
	city: string

	@ApiProperty({
		name: 'browser',
		description: 'Браузер, использованный для создания сессии',
		example: 'Chrome'
	})
	browser: string

	@ApiProperty({
		name: 'os',
		description: 'Операционная система устройства пользователя',
		example: 'Windows'
	})
	os: string

	@ApiProperty({
		name: 'type',
		description: 'Тип сессии (например, desktop, smartphone)',
		example: 'desktop'
	})
	type: string
}
