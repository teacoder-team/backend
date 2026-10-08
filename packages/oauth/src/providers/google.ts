import * as client from 'openid-client'

import type { OAuthClientCredentials, OAuthProvider } from '../types'

/** OpenID Connect. Metadata mirrors https://accounts.google.com/.well-known/openid-configuration */
export const google = ({
	clientId,
	clientSecret,
	timeout = 15
}: OAuthClientCredentials): OAuthProvider<'google'> => {
	const config = new client.Configuration(
		{
			issuer: 'https://accounts.google.com',
			authorization_endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
			token_endpoint: 'https://oauth2.googleapis.com/token',
			userinfo_endpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
			jwks_uri: 'https://www.googleapis.com/oauth2/v3/certs',
			code_challenge_methods_supported: ['S256'],
			id_token_signing_alg_values_supported: ['RS256'],
			authorization_response_iss_parameter_supported: true
		},
		clientId,
		clientSecret
	)

	config.timeout = timeout

	return {
		name: 'google',
		label: 'Google',
		config,
		scopes: ['openid', 'email', 'profile'],
		authorizationParams: { access_type: 'offline', prompt: 'consent' },

		async fetchProfile(tokens) {
			const claims = tokens.claims()!

			const email =
				typeof claims.email === 'string' && claims.email_verified === true
					? claims.email
					: null

			return {
				providerAccountId: claims.sub,
				email,
				name: typeof claims.name === 'string' ? claims.name : (email ?? 'Google user'),
				avatarUrl: typeof claims.picture === 'string' ? claims.picture : null
			}
		}
	}
}
