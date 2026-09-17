import type { AuthProvider } from '@prisma/generated/client'

export interface OAuthProfile {
	providerAccountId: string
	email: string | null
	name: string
	avatarUrl: string | null
}

export interface OAuthAuthorizeInput {
	state: string
	redirectUri: string
	codeChallenge?: string
}

export interface OAuthCallbackInput {
	query: Record<string, string | undefined>
	redirectUri: string
	codeVerifier?: string
}

export interface OAuthProviderAdapter {
	readonly provider: AuthProvider
	/** Whether `start` should generate a PKCE pair for this provider. */
	readonly usesPkce: boolean
	buildAuthorizeUrl(input: OAuthAuthorizeInput): string
	authenticate(input: OAuthCallbackInput): Promise<OAuthProfile>
}
