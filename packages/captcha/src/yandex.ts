import { createHttpClient } from '@teacoder/http'

import type { CaptchaCredentials, CaptchaVerifier } from './types'

interface ValidateResponse {
	status: 'ok' | 'failed'
	message?: string
	host?: string
}

export const yandexSmartCaptcha = ({
	secretKey,
	siteKey,
	timeout = 7000,
	logger
}: CaptchaCredentials): CaptchaVerifier<'yandex'> => {
	const http = createHttpClient({
		baseURL: 'https://smartcaptcha.cloud.yandex.ru',
		timeout,
		logger
	})

	return {
		provider: 'yandex',
		siteKey,

		async verify(token, { remoteIp } = {}) {
			const body = new URLSearchParams({ secret: secretKey, token })

			if (remoteIp) {
				body.set('ip', remoteIp)
			}

			const result = await http<ValidateResponse>('/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: body.toString()
			})

			const success = result.status === 'ok'

			return { success, errorCodes: success || !result.message ? [] : [result.message] }
		}
	}
}
