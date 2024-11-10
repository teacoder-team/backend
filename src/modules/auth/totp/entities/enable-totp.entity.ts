import { ApiProperty } from '@nestjs/swagger'

export class EnableTotpEntity {
	@ApiProperty({
		name: 'isTotpEnabled',
		description: 'Статус двухфакторной аутентификации для пользователя',
		example: true
	})
	isTotpEnabled: boolean

	@ApiProperty({
		name: 'totpSecret',
		description: 'Секрет, используемый для TOTP',
		example: 'JBSWY3DPEHPK3PXP'
	})
	totpSecret: string
}
