import { env } from '@/core/config/env'

const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/
const IPV6_REGEX = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/

const IP_HEADERS = [
	'cf-connecting-ip',
	'true-client-ip',
	'x-real-ip',
	'x-client-ip',
	'x-forwarded-for',
	'forwarded-for',
	'forwarded',
]

export function getClientIp(headers: Headers): string {
	if (env.NODE_ENV === 'development') return '104.28.225.185'

	for (const header of IP_HEADERS) {
		const value = headers.get(header)

		if (value) {
			if (header === 'x-forwarded-for') {
				const first = value.split(',')[0].trim()

				if (first) return first
			}

			return value.trim()
		}
	}

	return '127.0.0.1'
}

export function isIPv4(ip: string): boolean {
	if (!IPV4_REGEX.test(ip)) return false

	const parts = ip.split('.')

	return parts.every((part) => {
		const num = parseInt(part, 10)

		return num >= 0 && num <= 255
	})
}

export function isIPv6(ip: string): boolean {
	return IPV6_REGEX.test(ip)
}

export function v4ToLong(ip: string): number {
	if (!isIPv4(ip)) {
		throw new Error(`Invalid IPv4 address: ${ip}`)
	}

	return (
		ip
			.split('.')
			.reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
	)
}

export function longToV4(long: number): string {
	return [
		(long >>> 24) & 0xff,
		(long >>> 16) & 0xff,
		(long >>> 8) & 0xff,
		long & 0xff,
	].join('.')
}

export function anonymizeIp(ip: string): string {
	if (isIPv4(ip)) {
		return ip.replace(/\.\d+$/, '.xxx')
	}

	if (isIPv6(ip)) {
		const parts = ip.split(':')

		return `${parts.slice(0, 3).join(':')}:xxxx:xxxx:xxxx:xxxx:xxxx`
	}

	return 'xxx.xxx.xxx.xxx'
}

export function cidrV4Match(ip: string, cidr: string): boolean {
	const [range, bitsStr] = cidr.split('/')
	const bits = parseInt(bitsStr, 10)

	if (!isIPv4(ip) || !isIPv4(range) || isNaN(bits)) {
		return false
	}

	const ipLong = v4ToLong(ip)
	const rangeLong = v4ToLong(range)

	const mask = ~(2 ** (32 - bits) - 1) >>> 0

	return (ipLong & mask) === (rangeLong & mask)
}
