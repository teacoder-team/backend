import { isDevelopment } from '@/config/env'

const IP_HEADERS = [
	'cf-connecting-ip',
	'true-client-ip',
	'x-real-ip',
	'x-client-ip',
	'x-forwarded-for',
]

const LOOPBACK = '127.0.0.1'

/** A routable address so geo lookups return something useful while developing. */
const DEVELOPMENT_IP = '104.28.225.185'

export const getClientIp = (headers: Headers): string => {
	if (isDevelopment) return DEVELOPMENT_IP

	for (const header of IP_HEADERS) {
		const value = headers.get(header)
		if (!value) continue

		// x-forwarded-for is a chain: the client is the leftmost entry.
		const ip = value.split(',')[0]?.trim()
		if (ip) return ip
	}

	return LOOPBACK
}
