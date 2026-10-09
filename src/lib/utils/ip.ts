import ipaddr from 'ipaddr.js'

type Address = ipaddr.IPv4 | ipaddr.IPv6

const IP_HEADERS = [
	'cf-connecting-ip',
	'true-client-ip',
	'x-real-ip',
	'x-client-ip',
	'x-forwarded-for'
] as const

export const parseIp = (value: string): Address | null => {
	const candidate = value.trim()

	if (!ipaddr.IPv4.isValidFourPartDecimal(candidate) && !ipaddr.IPv6.isValid(candidate)) {
		return null
	}

	return ipaddr.process(candidate)
}

export const getForwardedIp = (headers: Headers): string | null => {
	for (const header of IP_HEADERS) {
		const first = headers.get(header)?.split(',')[0]
		const address = first ? parseIp(first) : null

		if (address) {
			return address.toString()
		}
	}

	return null
}

const toRange = (entry: string): [Address, number] => {
	if (entry.includes('/')) {
		return ipaddr.parseCIDR(entry)
	}

	const address = parseIp(entry)

	if (!address) {
		throw new Error(`Invalid IP allowlist entry: "${entry}"`)
	}

	return [address, address.kind() === 'ipv4' ? 32 : 128]
}

export const createIpAllowlist = (entries: readonly string[]) => {
	const ranges = entries.map(toRange)

	return (ip: string | null | undefined): boolean => {
		const address = ip ? parseIp(ip) : null

		if (!address) {
			return false
		}

		return ranges.some(
			([range, bits]) => address.kind() === range.kind() && address.match(range, bits)
		)
	}
}
