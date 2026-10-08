import type * as client from 'openid-client'

export interface OAuthProfile {
	providerAccountId: string
	/** Only set when the provider vouches the address is verified - safe to link accounts by. */
	email: string | null
	/** An address the provider gave without vouching for it: usable for mail, never for linking. */
	unverifiedEmail?: string | null | null
	name: string
	avatarUrl: string | null
}

export type OAuthTokens = client.TokenEndpointResponse & client.TokenEndpointResponseHelpers

export interface OAuthProvider<Name extends string = string> {
	readonly name: Name
	/** Human-readable, for messages shown to users. */
	readonly label: string
	readonly config: client.Configuration
	readonly scopes: string[]
	/** Provider-specific extras for the authorization request. */
	readonly authorizationParams?: Record<string, string>
	/** Provider-specific extras for the token request, read off the callback query. */
	tokenParams?(query: URLSearchParams): Record<string, string>
	fetchProfile(tokens: OAuthTokens): Promise<OAuthProfile>
}

export interface OAuthClientCredentials {
	clientId: string
	clientSecret: string
	/** Seconds per outgoing request. Default 15. */
	timeout?: number
}
