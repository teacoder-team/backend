export type OriginMatcher = (origin: string) => boolean

const WILDCARD_PREFIX = '*.'

const parsePattern = (raw: string) => {
	const [scheme, rest] = raw.split('://')

	if (!scheme || !rest) {
		throw new Error(`Invalid CORS origin "${raw}" - expected scheme://host[:port]`)
	}

	if (!rest.startsWith(WILDCARD_PREFIX)) {
		const url = new URL(raw)

		if (url.origin !== raw.replace(/\/+$/, '')) {
			throw new Error(`Invalid CORS origin "${raw}" - no path, query or trailing parts`)
		}

		return { exact: url.origin }
	}

	const url = new URL(`${scheme}://${rest.slice(WILDCARD_PREFIX.length)}`)

	return { protocol: url.protocol, port: url.port, suffix: `.${url.hostname}` }
}

export const createOriginMatcher = (patterns: readonly string[]): OriginMatcher => {
	const parsed = patterns.map(parsePattern)
	const exact = new Set(parsed.flatMap((pattern) => ('exact' in pattern ? [pattern.exact] : [])))
	const wildcards = parsed.filter((pattern) => !('exact' in pattern))

	return (origin) => {
		if (exact.has(origin)) {
			return true
		}

		let url: URL

		try {
			url = new URL(origin)
		} catch {
			return false
		}

		return wildcards.some(
			(pattern) =>
				'suffix' in pattern &&
				url.protocol === pattern.protocol &&
				url.port === pattern.port &&
				url.hostname.endsWith(pattern.suffix)
		)
	}
}

export const splitList = (value: string) =>
	value
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean)
