import { type CaptchaVerifier, turnstile, yandexSmartCaptcha } from '@teacoder/captcha'

import { env } from '~/config/env'
import { BadRequestError } from '~/lib/errors'
import { logger } from '~/lib/logger'

const createVerifier = (): CaptchaVerifier | null => {
	switch (env.CAPTCHA_PROVIDER) {
		case 'turnstile':
			return turnstile({
				secretKey: env.TURNSTILE_SECRET_KEY,
				siteKey: env.TURNSTILE_SITE_KEY,
				logger
			})
		case 'yandex':
			return yandexSmartCaptcha({
				secretKey: env.YANDEX_CAPTCHA_SECRET_KEY,
				siteKey: env.YANDEX_CAPTCHA_CLIENT_KEY,
				logger
			})
		case 'none':
			return null
	}
}

/** The active verifier, or null when CAPTCHA_PROVIDER=none. */
export const captcha = createVerifier()

/** A no-op without a provider. An unreachable provider fails closed. */
export const verifyCaptcha = async (token: string | undefined, remoteIp: string) => {
	if (!captcha) return

	if (!token) throw new BadRequestError('Captcha verification is required')

	const result = await captcha.verify(token, { remoteIp }).catch((err: unknown) => {
		logger.error(
			{ context: 'captcha', provider: captcha.provider, err },
			'captcha_request_failed'
		)

		return null
	})

	if (result?.success) return

	if (result) {
		logger.warn(
			{ context: 'captcha', provider: captcha.provider, errors: result.errorCodes },
			'captcha_verification_failed'
		)
	}

	throw new BadRequestError('Captcha verification failed')
}
