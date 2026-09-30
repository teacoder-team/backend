import { createFingerprintClient } from '@teacoder/fingerprint'

import { env } from '~/config/env'
import { logger } from '~/lib/logger'

/** The client calls `fp.get()` right before submitting, so a fresh event is minutes old at most. */
const EVENT_MAX_AGE_MS = 5 * 60 * 1000
const MIN_CONFIDENCE = 0.9

const APP_ORIGIN = new URL(env.APP_URL).origin

export const fingerprint = env.FINGERPRINT_SECRET_KEY
	? createFingerprintClient({
			secretKey: env.FINGERPRINT_SECRET_KEY,
			region: env.FINGERPRINT_REGION,
			logger
		})
	: null

/** Fails open: sign-in must never depend on Fingerprint, an unverified event just means no visitor. */
export const resolveVisitorId = async (eventId: string | undefined) => {
	if (!fingerprint || !eventId) {
		return null
	}

	const result = await fingerprint
		.identify(eventId, {
			maxAgeMs: EVENT_MAX_AGE_MS,
			allowedOrigins: [APP_ORIGIN],
			minConfidence: MIN_CONFIDENCE
		})
		.catch((err: unknown) => {
			logger.error({ context: 'fingerprint', err }, 'fingerprint_request_failed')

			return null
		})

	if (!result) {
		return null
	}

	if (!result.verified) {
		logger.warn({ context: 'fingerprint', reason: result.reason }, 'fingerprint_event_rejected')

		return null
	}

	return result.visitorId
}
