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

/** The authorization code could not be exchanged for tokens (expired, replayed, misconfigured client). */
export class OAuthExchangeError extends OAuthError {
	constructor(provider: OAuthProvider, options?: ErrorOptions) {
		super(provider, `${provider.label} rejected the authorization code`, options)
	}
}

/** Tokens were issued but the user's profile could not be read. */
export class OAuthProfileError extends OAuthError {
	constructor(provider: OAuthProvider, options?: ErrorOptions) {
		super(provider, `Failed to fetch ${provider.label} profile`, options)
	}
}
