import * as client from 'openid-client'

import { fetchJson } from '../protected-resource'
import type { OAuthClientCredentials, OAuthProvider } from '../types'

interface YandexProfile {
	id: string
	login: string
	real_name?: string
	display_name?: string
	default_email?: string
	default_avatar_id?: string
	is_avatar_empty?: boolean
}

export const yandex = ({
	clientId,
	clientSecret,
	timeout = 15
}: OAuthClientCredentials): OAuthProvider<'yandex'> => {
	const config = new client.Configuration(
		{
			issuer: 'https://oauth.yandex.ru',
			authorization_endpoint: 'https://oauth.yandex.ru/authorize',
			token_endpoint: 'https://oauth.yandex.ru/token'
		},
		clientId,
		clientSecret
	)

	config.timeout = timeout

	return {
		name: 'yandex',
		label: 'Yandex',
		config,

		scopes: [],

		async fetchProfile({ access_token }) {
			const profile = await fetchJson<YandexProfile>(
				config,
				access_token,
				'https://login.yandex.ru/info?format=json'
			)

			return {
				providerAccountId: profile.id,
				email: profile.default_email ?? null,
				name: profile.real_name ?? profile.display_name ?? profile.login,
				avatarUrl:
					profile.default_avatar_id && !profile.is_avatar_empty
						? `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
						: null
			}
		}
	}
}
