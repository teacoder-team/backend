import { isDevelopment } from '~/config/env'

const IP_HEADERS = [
	'cf-connecting-ip',
	'true-client-ip',
	'x-real-ip',
	'x-client-ip',
	'x-forwarded-for'
]

const LOOPBACK = '127.0.0.1'
const DEVELOPMENT_IP = '104.28.225.185'

/** The real forwarded IP, with no dev-mode faking - for callers that verify against it (e.g. webhook IP allowlists). */
export const getForwardedIp = (headers: Headers): string | null => {
	for (const header of IP_HEADERS) {
		const value = headers.get(header)
		if (!value) continue

		const ip = value.split(',')[0]?.trim()
		if (ip) return ip
	}

	return null
}

export const getClientIp = (headers: Headers): string => {
	if (isDevelopment) return DEVELOPMENT_IP

	return getForwardedIp(headers) ?? LOOPBACK
}
