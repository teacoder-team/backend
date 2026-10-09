import type * as client from 'openid-client'

export interface OAuthProfile {
	providerAccountId: string

	email: string | null

	unverifiedEmail?: string | null | null
	name: string
	avatarUrl: string | null
}

export type OAuthTokens = client.TokenEndpointResponse & client.TokenEndpointResponseHelpers

export interface OAuthProvider<Name extends string = string> {
	readonly name: Name

	readonly label: string
	readonly config: client.Configuration
	readonly scopes: string[]

	readonly authorizationParams?: Record<string, string>

	tokenParams?(query: URLSearchParams): Record<string, string>
	fetchProfile(tokens: OAuthTokens): Promise<OAuthProfile>
}

export interface OAuthClientCredentials {
	clientId: string
	clientSecret: string

	timeout?: number
}
