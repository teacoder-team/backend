import { AuthProvider } from '@prisma/generated/client'

import { env } from '~/config/env'
import { BadRequestError } from '~/shared/errors'

import type { OAuthProviderAdapter } from './types'

const AUTHORIZE_URL = 'https://discord.com/oauth2/authorize'
const TOKEN_URL = 'https://discord.com/api/oauth2/token'
const USERINFO_URL = 'https://discord.com/api/users/@me'

const SCOPES = ['identify', 'email']

interface DiscordTokenResponse {
	access_token: string
}

interface DiscordProfile {
	id: string
	username: string
	global_name: string | null
	email: string | null
	avatar: string | null
}

export const discordProvider: OAuthProviderAdapter = {
	provider: AuthProvider.DISCORD,
	usesPkce: true,

	buildAuthorizeUrl({ state, redirectUri, codeChallenge }) {
		const url = new URL(AUTHORIZE_URL)

		url.searchParams.set('client_id', env.DISCORD_CLIENT_ID)
		url.searchParams.set('redirect_uri', redirectUri)
		url.searchParams.set('response_type', 'code')
		url.searchParams.set('scope', SCOPES.join(' '))
		url.searchParams.set('state', state)
		url.searchParams.set('prompt', 'consent')

		if (codeChallenge) {
			url.searchParams.set('code_challenge', codeChallenge)
			url.searchParams.set('code_challenge_method', 'S256')
		}

		return url.toString()
	},

	async authenticate({ query, redirectUri, codeVerifier }) {
		const code = query.code

		if (!code) throw new BadRequestError('Discord did not return an authorization code')

		const response = await fetch(TOKEN_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				client_id: env.DISCORD_CLIENT_ID,
				client_secret: env.DISCORD_CLIENT_SECRET,
				code,
				redirect_uri: redirectUri,
				grant_type: 'authorization_code',
				...(codeVerifier ? { code_verifier: codeVerifier } : {})
			}),
			signal: AbortSignal.timeout(15_000)
		})

		if (!response.ok) throw new BadRequestError('Discord rejected the authorization code')

		const tokens = (await response.json()) as DiscordTokenResponse

		const profileResponse = await fetch(USERINFO_URL, {
			headers: { Authorization: `Bearer ${tokens.access_token}` },
			signal: AbortSignal.timeout(15_000)
		})

		if (!profileResponse.ok) throw new BadRequestError('Failed to fetch Discord profile')

		const profile = (await profileResponse.json()) as DiscordProfile

		const avatarUrl = profile.avatar
			? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
			: null

		return {
			providerAccountId: profile.id,
			email: profile.email,
			name: profile.global_name ?? profile.username,
			avatarUrl
		}
	}
}
