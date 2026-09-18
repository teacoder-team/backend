import ipaddr from 'ipaddr.js'

const matchesRange = (address: ipaddr.IPv4 | ipaddr.IPv6, range: string): boolean => {
	if (range.includes('/')) {
		const [rangeAddress, prefixLength] = ipaddr.parseCIDR(range)

		return address.kind() === rangeAddress.kind() && address.match([rangeAddress, prefixLength])
	}

	const rangeAddress = ipaddr.parse(range)

	return (
		address.kind() === rangeAddress.kind() &&
		address.toNormalizedString() === rangeAddress.toNormalizedString()
	)
}

export const isIpAllowed = (ip: string, ranges: readonly string[]): boolean => {
	try {
		const address = ipaddr.process(ip)

		return ranges.some((range) => matchesRange(address, range))
	} catch {
		return false
	}
}
