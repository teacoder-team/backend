import * as client from 'openid-client'

import { fetchJson } from '../protected-resource'
import type { OAuthClientCredentials, OAuthProvider } from '../types'

interface DiscordProfile {
	id: string
	username: string
	global_name: string | null
	email: string | null
	verified?: boolean
	avatar: string | null
}

/** Plain OAuth 2.0 - Discord publishes no discovery document and issues no id_token. */
export const discord = ({
	clientId,
	clientSecret,
	timeout = 15
}: OAuthClientCredentials): OAuthProvider<'discord'> => {
	const config = new client.Configuration(
		{
			issuer: 'https://discord.com',
			authorization_endpoint: 'https://discord.com/oauth2/authorize',
			token_endpoint: 'https://discord.com/api/oauth2/token',
			code_challenge_methods_supported: ['S256']
		},
		clientId,
		clientSecret
	)

	config.timeout = timeout

	return {
		name: 'discord',
		label: 'Discord',
		config,
		scopes: ['identify', 'email'],
		authorizationParams: { prompt: 'consent' },

		async fetchProfile({ access_token }) {
			const profile = await fetchJson<DiscordProfile>(
				config,
				access_token,
				'https://discord.com/api/users/@me'
			)

			return {
				providerAccountId: profile.id,
				email: profile.verified ? profile.email : null,
				name: profile.global_name ?? profile.username,
				avatarUrl: profile.avatar
					? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
					: null
			}
		}
	}
}
