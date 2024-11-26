import { ConfigService } from '@nestjs/config'
import type { ITurnstileOptions } from 'nest-cloudflare-turnstile'

export function getTurnstileConfig(
	configService: ConfigService
): ITurnstileOptions {
	return {
		secretKey: configService.getOrThrow<string>('CAPTCHA_SECRET_KEY'),
		tokenResponse: req => req.headers.turnstile
	}
}
