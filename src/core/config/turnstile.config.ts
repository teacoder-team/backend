import { ConfigService } from '@nestjs/config'
import type { TurnstileOptions } from 'nestjs-cloudflare-captcha'

import { parseBoolean } from '@/shared/utils/parse-boolean.util'

export function getTurnstileConfig(
	configService: ConfigService
): TurnstileOptions {
	return {
		secretKey: configService.getOrThrow<string>('CAPTCHA_SECRET_KEY'),
		token: req => req.body.captcha,
		skipIf:
			parseBoolean(
				configService.getOrThrow<string>('CAPTCHA_ENABLED')
			) === false
	}
}
