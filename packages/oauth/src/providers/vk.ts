import * as client from 'openid-client'

import type { OAuthClientCredentials, OAuthProvider } from '../types'

const USER_INFO_URL = 'https://id.vk.ru/oauth2/user_info'

interface VkUser {
	user_id: string | number
	first_name?: string
	last_name?: string
	email?: string
	avatar?: string
}

const normalizeTokenResponse: client.CustomFetch = async (url, options) => {
	const response = await fetch(url, options as RequestInit)

	if (!response.ok) {
		return response
	}

	const { id_token, ...body } = (await response.json()) as Record<string, unknown>

	return Response.json({ token_type: 'bearer', ...body })
}

/**
 * VK ID (OAuth 2.1): no discovery document, PKCE is mandatory, and the token request carries no
 * client secret - the verifier plus `device_id` is what VK authenticates the client by.
 */
export const vk = ({
	clientId,
	timeout = 15
}: Omit<OAuthClientCredentials, 'clientSecret'>): OAuthProvider<'vk'> => {
	const config = new client.Configuration(
		{
			issuer: 'https://id.vk.ru',
			authorization_endpoint: 'https://id.vk.ru/authorize',
			token_endpoint: 'https://id.vk.ru/oauth2/auth',
			code_challenge_methods_supported: ['S256']
		},
		clientId,
		undefined,
		client.None()
	)

	config.timeout = timeout
	config[client.customFetch] = normalizeTokenResponse

	return {
		name: 'vk',
		label: 'VK',
		config,
		scopes: ['vkid.personal_info', 'email'],

		/** VK ties the code to the device it was issued on and refuses to exchange it without. */
		tokenParams(query): Record<string, string> {
			const deviceId = query.get('device_id')

			return deviceId ? { device_id: deviceId } : {}
		},

		async fetchProfile({ access_token }) {
			const response = await fetch(USER_INFO_URL, {
				method: 'POST',
				headers: { 'content-type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({ access_token, client_id: clientId }),
				signal: AbortSignal.timeout(timeout * 1000)
			})

			if (!response.ok) {
				throw new Error(`${USER_INFO_URL} responded with ${response.status}`)
			}

			const { user } = (await response.json()) as { user?: VkUser }

			if (!user?.user_id) {
				throw new Error('VK ID returned no user')
			}

			const name = [user.first_name, user.last_name].filter(Boolean).join(' ')

			return {
				providerAccountId: String(user.user_id),
				email: null,
				unverifiedEmail: user.email ?? null,
				name: name || 'VK user',
				avatarUrl: user.avatar ?? null
			}
		}
	}
}
