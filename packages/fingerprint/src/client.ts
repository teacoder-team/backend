import { createHttpClient, HttpError, type HttpLogger } from '@teacoder/http'

export type FingerprintRegion = 'global' | 'eu' | 'ap'

const BASE_URLS: Record<FingerprintRegion, string> = {
	global: 'https://api.fpjs.io/v4',
	eu: 'https://eu.api.fpjs.io/v4',
	ap: 'https://ap.api.fpjs.io/v4'
}

export interface FingerprintEvent {
	event_id: string
	timestamp: number
	url?: string
	ip_address?: string
	replayed?: boolean
	identification?: {
		visitor_id: string
		confidence?: { score: number }
		visitor_found?: boolean
	}
}

export interface FingerprintClientOptions {
	/** Server API secret key - never the public one the browser agent uses. */
	secretKey: string
	/** Must match the workspace region, events are not visible from the others. Default `global`. */
	region?: FingerprintRegion
	/** Milliseconds. Default 5000. */
	timeout?: number
	logger?: HttpLogger
}

export interface IdentifyOptions {
	/** Oldest identification accepted, in milliseconds. */
	maxAgeMs: number
	/** Origins the identification may come from. Empty accepts any. */
	allowedOrigins?: readonly string[]
	/** 0..1, the lowest `confidence.score` accepted. */
	minConfidence?: number
}

export type IdentifyRejection =
	| 'not_found'
	| 'stale'
	| 'replayed'
	| 'foreign_origin'
	| 'low_confidence'

export type Identification =
	| { verified: true; visitorId: string; confidence: number | null }
	| { verified: false; reason: IdentifyRejection }

/** `code` is Fingerprint's own, e.g. `wrong_region` or `secret_api_key_not_found`. */
export class FingerprintError extends Error {
	constructor(
		readonly status: number,
		readonly code: string,
		message: string
	) {
		super(message)
		this.name = 'FingerprintError'
	}
}

interface ErrorBody {
	error?: { code?: string; message?: string }
}

const originOf = (url: string | undefined) => {
	if (!url) {
		return null
	}

	try {
		return new URL(url).origin
	} catch {
		return null
	}
}

export const createFingerprintClient = ({
	secretKey,
	region = 'global',
	timeout = 5000,
	logger
}: FingerprintClientOptions) => {
	const http = createHttpClient({
		baseURL: BASE_URLS[region],
		timeout,
		logger,
		headers: { Authorization: `Bearer ${secretKey}` }
	})

	/** Null for an id the workspace doesn't know - including a malformed one. */
	const getEvent = async (eventId: string) => {
		try {
			return await http<FingerprintEvent>(`/events/${encodeURIComponent(eventId)}`)
		} catch (err) {
			if (!(err instanceof HttpError)) {
				throw err
			}

			if (err.status === 400 || err.status === 404) {
				return null
			}

			const { error } = (err.body ?? {}) as ErrorBody

			throw new FingerprintError(
				err.status,
				error?.code ?? 'unknown',
				error?.message ?? err.message
			)
		}
	}

	/** The browser-sent id proves nothing by itself - trust only the event re-read from the API. */
	const identify = async (
		eventId: string,
		{ maxAgeMs, allowedOrigins = [], minConfidence = 0 }: IdentifyOptions
	): Promise<Identification> => {
		const event = await getEvent(eventId)
		const identification = event?.identification

		if (!event || !identification?.visitor_id) {
			return { verified: false, reason: 'not_found' }
		}

		if (event.replayed) {
			return { verified: false, reason: 'replayed' }
		}

		if (Date.now() - event.timestamp > maxAgeMs) {
			return { verified: false, reason: 'stale' }
		}

		const origin = originOf(event.url)

		if (allowedOrigins.length && (!origin || !allowedOrigins.includes(origin))) {
			return { verified: false, reason: 'foreign_origin' }
		}

		const confidence = identification.confidence?.score ?? null

		if (confidence !== null && confidence < minConfidence) {
			return { verified: false, reason: 'low_confidence' }
		}

		return { verified: true, visitorId: identification.visitor_id, confidence }
	}

	return { getEvent, identify }
}

export type FingerprintClient = ReturnType<typeof createFingerprintClient>
