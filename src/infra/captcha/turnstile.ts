import { env } from '~/config/env'
import { createHttpClient } from '~/infra/http/client'
import { logger } from '~/infra/logger'

const client = createHttpClient({
	baseURL: 'https://challenges.cloudflare.com/turnstile/v0',
	timeout: 7000
})

interface SiteverifyResponse {
	success: boolean
	'error-codes': string[]
}

export const verifyTurnstileToken = async (token: string, remoteIp: string): Promise<boolean> => {
	try {
		const result = await client<SiteverifyResponse>('/siteverify', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				secret: env.TURNSTILE_SECRET_KEY,
				response: token,
				remoteip: remoteIp
			})
		})

		if (!result.success) {
			logger.warn(
				{
					context: 'turnstile',
					errors: result['error-codes']
				},
				'turnstile_verification_failed'
			)
		}

		return result.success
	} catch (err) {
		logger.error({ context: 'turnstile', err }, 'turnstile_request_failed')

		return false
	}
}
