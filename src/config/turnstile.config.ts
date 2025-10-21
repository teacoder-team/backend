import { ConfigService } from '@nestjs/config'
import type { TurnstileOptions } from 'nestjs-cloudflare-captcha'

import { isDev } from '@/shared/utils'

export function getTurnstileConfig(
	configService: ConfigService
): TurnstileOptions {
	return {
		secretKey: configService.getOrThrow<string>('CAPTCHA_SECRET_KEY'),
		token: req => req.body.captcha,
		skipIf: isDev(configService)
	}
}
