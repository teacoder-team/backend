import { createHttpClient } from '@teacoder/http'

import type { CaptchaCredentials, CaptchaVerifier } from './types'

interface SiteverifyResponse {
	success: boolean
	'error-codes': string[]
}

/** Cloudflare Turnstile - https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ */
export const turnstile = ({
	secretKey,
	siteKey,
	timeout = 7000,
	logger
}: CaptchaCredentials): CaptchaVerifier<'turnstile'> => {
	const http = createHttpClient({
		baseURL: 'https://challenges.cloudflare.com/turnstile/v0',
		timeout,
		logger
	})

	return {
		provider: 'turnstile',
		siteKey,

		async verify(token, { remoteIp } = {}) {
			const result = await http<SiteverifyResponse>('/siteverify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ secret: secretKey, response: token, remoteip: remoteIp })
			})

			return { success: result.success, errorCodes: result['error-codes'] ?? [] }
		}
	}
}
