import type { OAuthProvider } from './types'

export class OAuthError extends Error {
	readonly provider: string

	constructor(provider: OAuthProvider, message: string, options?: ErrorOptions) {
		super(message, options)
		this.name = new.target.name
		this.provider = provider.name
	}
}

/** The provider redirected back with `error=...` - usually the user pressed "cancel". */
export class OAuthDeniedError extends OAuthError {
	constructor(
		provider: OAuthProvider,
		readonly code: string,
		options?: ErrorOptions
	) {
		super(
			provider,
			code === 'access_denied'
				? `${provider.label} sign-in was cancelled`
				: `${provider.label} returned an error: ${code}`,
			options
		)
	}
}

export type OAuthExchangeFailure = 'rejected' | 'invalid_response' | 'unreachable'

const EXCHANGE_MESSAGES: Record<OAuthExchangeFailure, (label: string) => string> = {
	rejected: (label) => `${label} rejected the authorization code`,
	invalid_response: (label) => `${label} returned a response that failed verification`,
	unreachable: (label) => `${label} could not be reached`
}

/**
 * The code was not turned into trusted tokens: `rejected` - the provider refused it (expired,
 * replayed, misconfigured client); `invalid_response` - it answered, but the tokens or ID token
 * failed validation; `unreachable` - network error or timeout.
 */
export class OAuthExchangeError extends OAuthError {
	constructor(
		provider: OAuthProvider,
		readonly reason: OAuthExchangeFailure,
		options?: ErrorOptions
	) {
		super(provider, EXCHANGE_MESSAGES[reason](provider.label), options)
	}
}

/** Tokens were issued but the user's profile could not be read. */
export class OAuthProfileError extends OAuthError {
	constructor(provider: OAuthProvider, options?: ErrorOptions) {
		super(provider, `Failed to fetch ${provider.label} profile`, options)
	}
}

const MAX_CAUSE_DEPTH = 6

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)

const shapeOf = (value: unknown) =>
	isRecord(value)
		? Object.fromEntries(
				Object.entries(value).map(([key, item]) => [
					key,
					Array.isArray(item) ? 'array' : item === null ? 'null' : typeof item
				])
			)
		: undefined

const ERROR_FIELDS = ['error', 'error_description', 'error_uri'] as const

const pickErrorFields = (body: Record<string, unknown>) =>
	Object.fromEntries(
		ERROR_FIELDS.filter((field) => typeof body[field] === 'string').map((field) => [
			field,
			body[field]
		])
	)

export const describeOAuthFailure = (err: unknown) => {
	const chain: { name: string; message: string; code?: unknown }[] = []
	let current: unknown = err
	let details: Record<string, unknown> | undefined

	for (let depth = 0; depth < MAX_CAUSE_DEPTH && current instanceof Error; depth++) {
		const code = (current as { code?: unknown }).code

		chain.push({ name: current.name, message: current.message, ...(code ? { code } : {}) })

		if (isRecord(current.cause) && !(current.cause instanceof Error)) {
			const { header, claims, body, expected, reason } = current.cause

			details = {
				header: isRecord(header)
					? { alg: header.alg, typ: header.typ, kid: header.kid }
					: undefined,
				claimTypes: shapeOf(claims),
				issuer: isRecord(claims) ? claims.iss : undefined,
				bodyTypes: shapeOf(body),
				...(isRecord(body) ? pickErrorFields(body) : {}),
				expected,
				reason
			}
		}

		current = current.cause
	}

	return { chain, details }
}
