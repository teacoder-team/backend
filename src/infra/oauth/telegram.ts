import { createRemoteJWKSet, jwtVerify } from 'jose'

import { AuthProvider } from '@prisma/generated/client'

import { env } from '~/config/env'
import { BadRequestError } from '~/shared/errors'

import type { OAuthProviderAdapter } from './types'

const AUTHORIZE_URL = 'https://oauth.telegram.org/auth'
const TOKEN_URL = 'https://oauth.telegram.org/token'
const ISSUER = 'https://oauth.telegram.org'

const SCOPES = ['openid', 'profile']

const jwks = createRemoteJWKSet(new URL('https://oauth.telegram.org/.well-known/jwks.json'))

interface TelegramTokenResponse {
	id_token?: string
}

interface TelegramIdTokenClaims {
	sub: string
	id?: number
	name?: string
	given_name?: string
	family_name?: string
	preferred_username?: string
	picture?: string
}

const verifyIdToken = async (idToken: string): Promise<TelegramIdTokenClaims> => {
	try {
		const { payload } = await jwtVerify(idToken, jwks, {
			issuer: ISSUER,
			audience: env.TELEGRAM_CLIENT_ID
		})

		return payload as unknown as TelegramIdTokenClaims
	} catch {
		throw new BadRequestError('Telegram id token failed verification')
	}
}

export const telegramProvider: OAuthProviderAdapter = {
	provider: AuthProvider.TELEGRAM,
	usesPkce: true,

	buildAuthorizeUrl({ state, redirectUri, codeChallenge }) {
		const url = new URL(AUTHORIZE_URL)

		url.searchParams.set('client_id', env.TELEGRAM_CLIENT_ID)
		url.searchParams.set('redirect_uri', redirectUri)
		url.searchParams.set('response_type', 'code')
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

		if (!code) throw new BadRequestError('Telegram did not return an authorization code')

		const basicAuth = Buffer.from(
			`${env.TELEGRAM_CLIENT_ID}:${env.TELEGRAM_CLIENT_SECRET}`
		).toString('base64')

		const response = await fetch(TOKEN_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Authorization: `Basic ${basicAuth}`
			},
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				redirect_uri: redirectUri,
				client_id: env.TELEGRAM_CLIENT_ID,
				...(codeVerifier ? { code_verifier: codeVerifier } : {})
			}),
			signal: AbortSignal.timeout(15_000)
		})

		if (!response.ok) throw new BadRequestError('Telegram rejected the authorization code')

		const tokens = (await response.json()) as TelegramTokenResponse

		if (!tokens.id_token) throw new BadRequestError('Telegram did not return an id token')

		const claims = await verifyIdToken(tokens.id_token)

		const name =
			claims.name ??
			[claims.given_name, claims.family_name].filter(Boolean).join(' ') ??
			claims.preferred_username

		return {
			providerAccountId: String(claims.id ?? claims.sub),
			email: null,
			name: name || 'Telegram user',
			avatarUrl: claims.picture ?? null
		}
	}
}
