import * as client from 'openid-client'

import { OAuthDeniedError, OAuthExchangeError, OAuthProfileError } from './errors'
import type { OAuthProfile, OAuthProvider, OAuthTokens } from './types'

export interface AuthorizationRequest {
	/** Send the user here. */
	url: string
	/** Keep server-side until the callback - it identifies and protects the flow. */
	state: string
	/** Only when the provider advertises PKCE. Keep it next to `state`. */
	codeVerifier?: string
}

export const createAuthorization = async (
	provider: OAuthProvider,
	{ redirectUri }: { redirectUri: string }
): Promise<AuthorizationRequest> => {
	const state = client.randomState()

	const parameters: Record<string, string> = {
		redirect_uri: redirectUri,
		state,
		...provider.authorizationParams
	}

	if (provider.scopes.length) {
		parameters.scope = provider.scopes.join(' ')
	}

	let codeVerifier: string | undefined

	if (provider.config.serverMetadata().supportsPKCE()) {
		codeVerifier = client.randomPKCECodeVerifier()
		parameters.code_challenge = await client.calculatePKCECodeChallenge(codeVerifier)
		parameters.code_challenge_method = 'S256'
	}

	return {
		url: client.buildAuthorizationUrl(provider.config, parameters).href,
		state,
		codeVerifier
	}
}

/**
 * @param callbackUrl The full URL the provider redirected to, query included. Its
 *   origin and path must equal the redirect_uri - openid-client derives it from here.
 */
export const completeAuthorization = async (
	provider: OAuthProvider,
	callbackUrl: URL,
	{ state, codeVerifier }: Pick<AuthorizationRequest, 'state' | 'codeVerifier'>
): Promise<OAuthProfile> => {
	let tokens: OAuthTokens

	try {
		tokens = await client.authorizationCodeGrant(provider.config, callbackUrl, {
			expectedState: state,
			pkceCodeVerifier: codeVerifier,
			idTokenExpected: provider.scopes.includes('openid')
		})
	} catch (err) {
		if (err instanceof client.AuthorizationResponseError) {
			throw new OAuthDeniedError(provider, err.error, { cause: err })
		}

		throw new OAuthExchangeError(provider, { cause: err })
	}

	try {
		return await provider.fetchProfile(tokens)
	} catch (err) {
		throw new OAuthProfileError(provider, { cause: err })
	}
}
