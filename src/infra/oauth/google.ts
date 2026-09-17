import { AuthProvider } from '@prisma/generated/client'

import { env } from '~/config/env'
import { BadRequestError } from '~/shared/errors'

import type { OAuthProviderAdapter } from './types'

const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'

const SCOPES = ['openid', 'email', 'profile']

interface GoogleTokenResponse {
	access_token: string
}

interface GoogleProfile {
	sub: string
	email?: string
	name?: string
	picture?: string
}

export const googleProvider: OAuthProviderAdapter = {
	provider: AuthProvider.GOOGLE,
	usesPkce: true,

	buildAuthorizeUrl({ state, redirectUri, codeChallenge }) {
		const url = new URL(AUTHORIZE_URL)

		url.searchParams.set('client_id', env.GOOGLE_CLIENT_ID)
		url.searchParams.set('redirect_uri', redirectUri)
		url.searchParams.set('response_type', 'code')
		url.searchParams.set('scope', SCOPES.join(' '))
		url.searchParams.set('state', state)
		url.searchParams.set('access_type', 'offline')
		url.searchParams.set('prompt', 'consent')

		if (codeChallenge) {
			url.searchParams.set('code_challenge', codeChallenge)
			url.searchParams.set('code_challenge_method', 'S256')
		}

		return url.toString()
	},

	async authenticate({ query, redirectUri, codeVerifier }) {
		const code = query.code

		if (!code) throw new BadRequestError('Google did not return an authorization code')

		const response = await fetch(TOKEN_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: env.GOOGLE_CLIENT_ID,
				client_secret: env.GOOGLE_CLIENT_SECRET,
				code,
				redirect_uri: redirectUri,
				grant_type: 'authorization_code',
				...(codeVerifier ? { code_verifier: codeVerifier } : {})
			}),
			signal: AbortSignal.timeout(15_000)
		})

		if (!response.ok) throw new BadRequestError('Google rejected the authorization code')

		const tokens = (await response.json()) as GoogleTokenResponse

		const profileResponse = await fetch(USERINFO_URL, {
			headers: { Authorization: `Bearer ${tokens.access_token}` },
			signal: AbortSignal.timeout(15_000)
		})

		if (!profileResponse.ok) throw new BadRequestError('Failed to fetch Google profile')

		const profile = (await profileResponse.json()) as GoogleProfile

		return {
			providerAccountId: profile.sub,
			email: profile.email ?? null,
			name: profile.name ?? profile.email ?? 'Google user',
			avatarUrl: profile.picture ?? null
		}
	}
}
