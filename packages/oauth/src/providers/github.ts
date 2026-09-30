import * as client from 'openid-client'

import { fetchJson } from '../protected-resource'
import type { OAuthClientCredentials, OAuthProvider } from '../types'

const HEADERS = { Accept: 'application/vnd.github+json' }

interface GithubProfile {
	id: number
	login: string
	name: string | null
	avatar_url: string
}

interface GithubEmail {
	email: string
	primary: boolean
	verified: boolean
}

/** Plain OAuth 2.0 - GitHub publishes no discovery document and issues no id_token. */
export const github = ({
	clientId,
	clientSecret,
	timeout = 15
}: OAuthClientCredentials): OAuthProvider<'github'> => {
	const config = new client.Configuration(
		{
			issuer: 'https://github.com',
			authorization_endpoint: 'https://github.com/login/oauth/authorize',
			token_endpoint: 'https://github.com/login/oauth/access_token',
			code_challenge_methods_supported: ['S256']
		},
		clientId,
		clientSecret
	)

	config.timeout = timeout

	return {
		name: 'github',
		label: 'GitHub',
		config,
		scopes: ['read:user', 'user:email'],

		async fetchProfile({ access_token }) {
			const [profile, emails] = await Promise.all([
				fetchJson<GithubProfile>(
					config,
					access_token,
					'https://api.github.com/user',
					HEADERS
				),
				fetchJson<GithubEmail[]>(
					config,
					access_token,
					'https://api.github.com/user/emails',
					HEADERS
				).catch(() => [])
			])

			const verified = emails.filter((email) => email.verified)
			const email = (verified.find((entry) => entry.primary) ?? verified[0])?.email ?? null

			return {
				providerAccountId: String(profile.id),
				email,
				name: profile.name ?? profile.login,
				avatarUrl: profile.avatar_url
			}
		}
	}
}
