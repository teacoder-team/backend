import ipaddr from 'ipaddr.js'

type Address = ipaddr.IPv4 | ipaddr.IPv6

/** Checked in order - the first header carrying a valid address wins. */
const IP_HEADERS = [
	'cf-connecting-ip',
	'true-client-ip',
	'x-real-ip',
	'x-client-ip',
	'x-forwarded-for'
] as const

/**
 * Strict parse: four-part IPv4 or IPv6 only - ipaddr's lenient forms like "127.1" are refused.
 * IPv4-mapped IPv6 ("::ffff:1.2.3.4") comes back as plain IPv4, so one client has one identity.
 */
export const parseIp = (value: string): Address | null => {
	const candidate = value.trim()

	if (!ipaddr.IPv4.isValidFourPartDecimal(candidate) && !ipaddr.IPv6.isValid(candidate)) {
		return null
	}

	return ipaddr.process(candidate)
}

/** The client address proxies report, normalized. Invalid header values are skipped, not trusted. */
export const getForwardedIp = (headers: Headers): string | null => {
	for (const header of IP_HEADERS) {
		const first = headers.get(header)?.split(',')[0]
		const address = first ? parseIp(first) : null

		if (address) return address.toString()
	}

	return null
}

const toRange = (entry: string): [Address, number] => {
	if (entry.includes('/')) return ipaddr.parseCIDR(entry)

	const address = parseIp(entry)

	if (!address) throw new Error(`Invalid IP allowlist entry: "${entry}"`)

	return [address, address.kind() === 'ipv4' ? 32 : 128]
}

/**
 * Compiles exact addresses and CIDR ranges once, up front - a malformed entry throws at
 * startup instead of silently never matching.
 */
export const createIpAllowlist = (entries: readonly string[]) => {
	const ranges = entries.map(toRange)

	return (ip: string | null | undefined): boolean => {
		const address = ip ? parseIp(ip) : null

		if (!address) return false

		return ranges.some(
			([range, bits]) => address.kind() === range.kind() && address.match(range, bits)
		)
	}
}
