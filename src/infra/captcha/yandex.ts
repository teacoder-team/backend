import { env } from '~/config/env'
import { createHttpClient } from '~/infra/http/client'
import { logger } from '~/infra/logger'

const client = createHttpClient({
	baseURL: 'https://smartcaptcha.cloud.yandex.ru',
	timeout: 7000
})

interface ValidateResponse {
	status: 'ok' | 'failed'
	message?: string
	host?: string
}

export const verifyYandexCaptchaToken = async (
	token: string,
	remoteIp: string
): Promise<boolean> => {
	try {
		const body = new URLSearchParams({
			secret: env.YANDEX_CAPTCHA_SECRET_KEY,
			token,
			ip: remoteIp
		})

		const result = await client<ValidateResponse>('/validate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: body.toString()
		})

		if (result.status !== 'ok') {
			logger.warn(
				{
					context: 'yandex_captcha',
					message: result.message
				},
				'yandex_captcha_verification_failed'
			)
		}

		return result.status === 'ok'
	} catch (err) {
		logger.error({ context: 'yandex_captcha', err }, 'yandex_captcha_request_failed')

		return false
	}
}
