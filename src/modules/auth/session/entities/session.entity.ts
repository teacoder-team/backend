import { ApiProperty } from '@nestjs/swagger'

export class LocationInfo {
	@ApiProperty({
		name: 'country',
		description: 'Страна пользователя',
		example: 'Россия'
	})
	country: string

	@ApiProperty({
		name: 'city',
		description: 'Город пользователя',
		example: 'Москва'
	})
	city: string

	@ApiProperty({
		name: 'latitude',
		description: 'Широта местоположения',
		example: 55.7558
	})
	latitude: number

	@ApiProperty({
		name: 'longitude',
		description: 'Долгота местоположения',
		example: 37.6173
	})
	longitude: number
}

export class DeviceInfo {
	@ApiProperty({
		name: 'browser',
		description: 'Тип браузера пользователя',
		example: 'Chrome'
	})
	browser: string

	@ApiProperty({
		name: 'os',
		description: 'Операционная система устройства',
		example: 'Windows'
	})
	os: string

	@ApiProperty({
		name: 'type',
		description: 'Тип устройства пользователя',
		example: 'Desktop'
	})
	type: string
}

export class SessionMetadata {
	@ApiProperty({
		name: 'location',
		description: 'Информация о местоположении пользователя',
		type: LocationInfo
	})
	location: LocationInfo

	@ApiProperty({
		name: 'device',
		description: 'Информация об устройстве пользователя',
		type: DeviceInfo
	})
	device: DeviceInfo

	@ApiProperty({
		name: 'ip',
		description: 'IP-адрес пользователя',
		example: '192.168.1.1'
	})
	ip: string
}

export class SessionEntity {
	@ApiProperty({
		name: 'id',
		description: 'Уникальный идентификатор сессии',
		example: 'session-id-12345'
	})
	id: string

	@ApiProperty({
		name: 'createdAt',
		description: 'Дата и время создания сессии',
		example: '2024-11-09T10:00:00Z'
	})
	createdAt: Date

	@ApiProperty({
		name: 'metadata',
		description:
			'Данные метаданных сессии (местоположение, устройство, IP)',
		type: SessionMetadata
	})
	metadata: SessionMetadata
}
