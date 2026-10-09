import * as client from 'openid-client'

import {
	OAuthDeniedError,
	OAuthExchangeError,
	type OAuthExchangeFailure,
	OAuthProfileError
} from './errors'
import type { OAuthProfile, OAuthProvider, OAuthTokens } from './types'

export interface AuthorizationRequest {
	url: string

	state: string

	codeVerifier?: string
}

const VERIFICATION_CODES = new Set([
	'OAUTH_INVALID_RESPONSE',
	'OAUTH_PARSE_ERROR',
	'OAUTH_JWT_CLAIM_COMPARISON_FAILED',
	'OAUTH_JWT_TIMESTAMP_CHECK_FAILED',
	'OAUTH_JSON_ATTRIBUTE_COMPARISON_FAILED',
	'OAUTH_KEY_SELECTION_FAILED',
	'OAUTH_UNSUPPORTED_OPERATION'
])

const exchangeFailure = (err: unknown): OAuthExchangeFailure => {
	if (err instanceof client.ResponseBodyError) {
		return 'rejected'
	}

	const code = (err as { code?: unknown }).code

	if (typeof code === 'string' && VERIFICATION_CODES.has(code)) {
		return 'invalid_response'
	}

	if (code === 'OAUTH_TIMEOUT' || err instanceof TypeError) {
		return 'unreachable'
	}

	return 'rejected'
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

export const completeAuthorization = async (
	provider: OAuthProvider,
	callbackUrl: URL,
	{ state, codeVerifier }: Pick<AuthorizationRequest, 'state' | 'codeVerifier'>
): Promise<OAuthProfile> => {
	let tokens: OAuthTokens

	try {
		tokens = await client.authorizationCodeGrant(
			provider.config,
			callbackUrl,
			{
				expectedState: state,
				pkceCodeVerifier: codeVerifier,
				idTokenExpected: provider.scopes.includes('openid')
			},
			provider.tokenParams?.(callbackUrl.searchParams)
		)
	} catch (err) {
		if (err instanceof client.AuthorizationResponseError) {
			throw new OAuthDeniedError(provider, err.error, { cause: err })
		}

		throw new OAuthExchangeError(provider, exchangeFailure(err), { cause: err })
	}

	try {
		return await provider.fetchProfile(tokens)
	} catch (err) {
		throw new OAuthProfileError(provider, { cause: err })
	}
}
