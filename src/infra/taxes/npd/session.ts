import { createHash } from 'node:crypto'

import { env } from '@/config/env'
import { createHttpClient } from '@/infra/http/client'
import { logger } from '@/infra/logger'
import {
	API_URL,
	type AuthResponse,
	type DeviceInfo,
	type Profile,
} from './types'

const EXPIRY_SKEW_MS = 60_000
const FALLBACK_TTL_MS = 55 * 60 * 1000

const APP_VERSION = '1.0.0'
const USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const DEVICE_ID_LENGTH = 21

const deviceId =
	env.NPD_DEVICE_ID ||
	createHash('sha256')
		.update(env.NPD_INN)
		.digest('hex')
		.slice(0, DEVICE_ID_LENGTH)

const deviceInfo: DeviceInfo = {
	sourceDeviceId: deviceId,
	sourceType: 'WEB',
	appVersion: APP_VERSION,
	metaDetails: { userAgent: USER_AGENT },
}

const authClient = createHttpClient({
	baseURL: API_URL,
	timeout: 10_000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json, text/plain, */*',
		Referer: 'https://lknpd.nalog.ru/',
		'User-Agent': USER_AGENT,
	},
})

interface Session {
	token: string
	refreshToken: string
	expiresAt: number
	profile: Profile
}

let session: Session | null = null
let renewal: Promise<Session> | null = null

const expiryOf = (response: AuthResponse) => {
	const stated = response.tokenExpireIn
		? Date.parse(response.tokenExpireIn)
		: Number.NaN

	return Number.isNaN(stated) ? Date.now() + FALLBACK_TTL_MS : stated
}

const toSession = (response: AuthResponse): Session => ({
	token: response.token,
	refreshToken: response.refreshToken,
	expiresAt: expiryOf(response),
	profile: response.profile,
})

const signIn = async (): Promise<Session> => {
	const response = await authClient<AuthResponse>('/auth/lkfl', {
		method: 'POST',
		body: JSON.stringify({
			username: env.NPD_INN,
			password: env.NPD_PASSWORD,
			deviceInfo,
		}),
	})

	logger.info({ context: 'npd', inn: response.profile.inn }, 'npd_signed_in')

	return toSession(response)
}

const refresh = async (current: Session): Promise<Session> => {
	const response = await authClient<AuthResponse>('/auth/token', {
		method: 'POST',
		body: JSON.stringify({
			refreshToken: current.refreshToken,
			deviceInfo: { sourceDeviceId: deviceId },
		}),
	})

	logger.debug({ context: 'npd' }, 'npd_token_refreshed')

	return {
		...toSession(response),
		refreshToken: response.refreshToken || current.refreshToken,
		profile: response.profile ?? current.profile,
	}
}

const renew = (): Promise<Session> => {
	renewal ??= (async () => {
		try {
			const previous = session

			session = previous
				? await refresh(previous).catch(async (err) => {
						logger.warn(
							{ context: 'npd', err },
							'npd_refresh_failed_signing_in',
						)

						return signIn()
					})
				: await signIn()

			return session
		} finally {
			renewal = null
		}
	})()

	return renewal
}

const isUsable = (current: Session) =>
	current.expiresAt - EXPIRY_SKEW_MS > Date.now()

export const getAccessToken = async (): Promise<string> => {
	if (session && isUsable(session)) return session.token

	return (await renew()).token
}

export const getProfile = async (): Promise<Profile> => {
	if (session && isUsable(session)) return session.profile

	return (await renew()).profile
}

export const getAccountInn = async () => (await getProfile()).inn

export const getDeviceId = () => deviceId

export const invalidateAccessToken = () => {
	if (session) session = { ...session, expiresAt: 0 }
}

export const resetSession = () => {
	session = null
	renewal = null
}
