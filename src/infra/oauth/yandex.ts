import { AuthProvider } from '@prisma/generated/client'

import { env } from '~/config/env'
import { BadRequestError } from '~/shared/errors'

import type { OAuthProviderAdapter } from './types'

const AUTHORIZE_URL = 'https://oauth.yandex.ru/authorize'
const TOKEN_URL = 'https://oauth.yandex.ru/token'
const USERINFO_URL = 'https://login.yandex.ru/info?format=json'

interface YandexTokenResponse {
	access_token: string
}

interface YandexProfile {
	id: string
	login: string
	real_name?: string
	display_name?: string
	default_email?: string
	default_avatar_id?: string
	is_avatar_empty?: boolean
}

export const yandexProvider: OAuthProviderAdapter = {
	provider: AuthProvider.YANDEX,
	usesPkce: false,

	buildAuthorizeUrl({ state, redirectUri }) {
		const url = new URL(AUTHORIZE_URL)

		url.searchParams.set('client_id', env.YANDEX_CLIENT_ID)
		url.searchParams.set('redirect_uri', redirectUri)
		url.searchParams.set('response_type', 'code')
		url.searchParams.set('state', state)

		return url.toString()
	},

	async authenticate({ query, redirectUri }) {
		const code = query.code

		if (!code) throw new BadRequestError('Yandex did not return an authorization code')

		const response = await fetch(TOKEN_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				code,
				client_id: env.YANDEX_CLIENT_ID,
				client_secret: env.YANDEX_CLIENT_SECRET,
				redirect_uri: redirectUri
			}),
			signal: AbortSignal.timeout(15_000)
		})

		if (!response.ok) throw new BadRequestError('Yandex rejected the authorization code')

		const tokens = (await response.json()) as YandexTokenResponse

		const profileResponse = await fetch(USERINFO_URL, {
			headers: { Authorization: `Bearer ${tokens.access_token}` },
			signal: AbortSignal.timeout(15_000)
		})

		if (!profileResponse.ok) throw new BadRequestError('Failed to fetch Yandex profile')

		const profile = (await profileResponse.json()) as YandexProfile

		const avatarUrl =
			profile.default_avatar_id && !profile.is_avatar_empty
				? `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
				: null

		return {
			providerAccountId: profile.id,
			email: profile.default_email ?? null,
			name: profile.real_name ?? profile.display_name ?? profile.login,
			avatarUrl
		}
	}
}
