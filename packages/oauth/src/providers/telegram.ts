import * as client from 'openid-client'

import type { OAuthClientCredentials, OAuthProvider } from '../types'

export const telegram = ({
	clientId,
	clientSecret,
	timeout = 15
}: OAuthClientCredentials): OAuthProvider<'telegram'> => {
	const config = new client.Configuration(
		{
			issuer: 'https://oauth.telegram.org',
			authorization_endpoint: 'https://oauth.telegram.org/auth',
			token_endpoint: 'https://oauth.telegram.org/token',
			jwks_uri: 'https://oauth.telegram.org/.well-known/jwks.json',
			code_challenge_methods_supported: ['S256'],
			id_token_signing_alg_values_supported: ['RS256', 'ES256', 'EdDSA']
		},
		clientId,
		clientSecret,
		client.ClientSecretBasic(clientSecret)
	)

	config.timeout = timeout

	return {
		name: 'telegram',
		label: 'Telegram',
		config,
		scopes: ['openid', 'profile'],

		async fetchProfile(tokens) {
			const claims = tokens.claims()!

			const name =
				(typeof claims.name === 'string' && claims.name) ||
				(typeof claims.preferred_username === 'string' && claims.preferred_username) ||
				'Telegram user'

			return {
				providerAccountId: String(claims.id ?? claims.sub),
				email: null,
				name,
				avatarUrl: typeof claims.picture === 'string' ? claims.picture : null
			}
		}
	}
}
