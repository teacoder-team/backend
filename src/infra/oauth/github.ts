import { AuthProvider } from '@prisma/generated/client'

import { env } from '~/config/env'
import { BadRequestError } from '~/shared/errors'

import type { OAuthProviderAdapter } from './types'

const AUTHORIZE_URL = 'https://github.com/login/oauth/authorize'
const TOKEN_URL = 'https://github.com/login/oauth/access_token'
const USER_URL = 'https://api.github.com/user'
const EMAILS_URL = 'https://api.github.com/user/emails'

const SCOPES = ['read:user', 'user:email']

interface GithubTokenResponse {
	access_token: string
}

interface GithubProfile {
	id: number
	login: string
	name: string | null
	email: string | null
	avatar_url: string
}

interface GithubEmail {
	email: string
	primary: boolean
	verified: boolean
}

const githubHeaders = (accessToken: string) => ({
	Authorization: `Bearer ${accessToken}`,
	Accept: 'application/vnd.github+json'
})

const fetchPrimaryEmail = async (accessToken: string): Promise<string | null> => {
	const response = await fetch(EMAILS_URL, {
		headers: githubHeaders(accessToken),
		signal: AbortSignal.timeout(15_000)
	})

	if (!response.ok) return null

	const emails = (await response.json()) as GithubEmail[]

	return (emails.find((email) => email.primary) ?? emails[0])?.email ?? null
}

export const githubProvider: OAuthProviderAdapter = {
	provider: AuthProvider.GITHUB,
	usesPkce: true,

	buildAuthorizeUrl({ state, redirectUri, codeChallenge }) {
		const url = new URL(AUTHORIZE_URL)

		url.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
		url.searchParams.set('redirect_uri', redirectUri)
		url.searchParams.set('scope', SCOPES.join(' '))
		url.searchParams.set('state', state)

		if (codeChallenge) {
			url.searchParams.set('code_challenge', codeChallenge)
			url.searchParams.set('code_challenge_method', 'S256')
		}

		return url.toString()
	},

	async authenticate({ query, redirectUri, codeVerifier }) {
		const code = query.code

		if (!code) throw new BadRequestError('GitHub did not return an authorization code')

		const response = await fetch(TOKEN_URL, {
			method: 'POST',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
			body: JSON.stringify({
				client_id: env.GITHUB_CLIENT_ID,
				client_secret: env.GITHUB_CLIENT_SECRET,
				code,
				redirect_uri: redirectUri,
				...(codeVerifier ? { code_verifier: codeVerifier } : {})
			}),
			signal: AbortSignal.timeout(15_000)
		})

		if (!response.ok) throw new BadRequestError('GitHub rejected the authorization code')

		const tokens = (await response.json()) as GithubTokenResponse

		if (!tokens.access_token)
			throw new BadRequestError('GitHub rejected the authorization code')

		const profileResponse = await fetch(USER_URL, {
			headers: githubHeaders(tokens.access_token),
			signal: AbortSignal.timeout(15_000)
		})

		if (!profileResponse.ok) throw new BadRequestError('Failed to fetch GitHub profile')

		const profile = (await profileResponse.json()) as GithubProfile
		const email = profile.email ?? (await fetchPrimaryEmail(tokens.access_token))

		return {
			providerAccountId: String(profile.id),
			email,
			name: profile.name ?? profile.login,
			avatarUrl: profile.avatar_url
		}
	}
}
