import { ConfigService } from '@nestjs/config'
import type { YookassaOptions } from 'nestjs-yookassa'

export function getYookassaConfig(
	configService: ConfigService
): YookassaOptions {
	return {
		shopId: configService.getOrThrow<string>('YOOKASSA_SHOP_ID'),
		apiKey: configService.getOrThrow<string>('YOOKASSA_API_KEY')
	}
}
