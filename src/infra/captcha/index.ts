import { env } from '~/config/env'
import { BadRequestError } from '~/shared/errors'

import { verifyTurnstileToken } from './turnstile'
import { verifyYandexCaptchaToken } from './yandex'

/** Throws when the token is missing or fails verification. A no-op when CAPTCHA_PROVIDER=none. */
export const verifyCaptcha = async (token: string | undefined, remoteIp: string): Promise<void> => {
	if (env.CAPTCHA_PROVIDER === 'none') return

	if (!token) throw new BadRequestError('Captcha verification is required')

	const isValid =
		env.CAPTCHA_PROVIDER === 'turnstile'
			? await verifyTurnstileToken(token, remoteIp)
			: await verifyYandexCaptchaToken(token, remoteIp)

	if (!isValid) throw new BadRequestError('Captcha verification failed')
}
