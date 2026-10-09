const ENTITIES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	laquo: '«',
	raquo: '»',
	mdash: '—',
	ndash: '–',
	hellip: '…'
}

const decodeEntities = (value: string) =>
	value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
		if (/^#x/i.test(entity)) {
			return String.fromCodePoint(Number.parseInt(entity.slice(2), 16))
		}

		if (entity.startsWith('#')) {
			return String.fromCodePoint(Number.parseInt(entity.slice(1), 10))
		}

		return ENTITIES[entity.toLowerCase()] ?? match
	})

export const htmlToText = (html: string) =>
	decodeEntities(
		html
			.replace(/<(head|style|script)[\s\S]*?<\/\1>/gi, '')
			.replace(/<br\s*\/?>/gi, '\n')
			.replace(/<\/(p|div|li|tr|h[1-6]|blockquote)>/gi, '\n')
			.replace(/<li[^>]*>/gi, '• ')
			.replace(/<[^>]+>/g, '')
	)

const QUOTE_HEADERS = [
	/^On .+ wrote:$/,
	/^.+(пишет|написал|написала)\s*:$/i,
	/^-{2,}\s*(Original Message|Исходное сообщение|Пересылаемое сообщение)\s*-{2,}$/i
]

const isQuoteStart = (line: string) => {
	const trimmed = line.trim()

	return trimmed.startsWith('>') || QUOTE_HEADERS.some((pattern) => pattern.test(trimmed))
}

export const stripQuotedReply = (text: string) => {
	const lines = text.replace(/\r\n?/g, '\n').split('\n')
	const end = lines.findIndex(isQuoteStart)
	const kept = end === -1 ? lines : lines.slice(0, end)

	return kept
		.map((line) => line.trimEnd())
		.join('\n')
		.replace(/\n{3,}/g, '\n\n')
		.trim()
}

const decodeQ = (data: string) =>
	Buffer.from(
		data
			.replace(/_/g, ' ')
			.replace(/=([\da-f]{2})/gi, (_, hex: string) =>
				String.fromCharCode(Number.parseInt(hex, 16))
			),
		'latin1'
	)

const decodeWord = (match: string, charset: string, kind: string, data: string) => {
	try {
		const bytes = kind.toUpperCase() === 'B' ? Buffer.from(data, 'base64') : decodeQ(data)

		return new TextDecoder(charset).decode(bytes)
	} catch {
		return match
	}
}

const decodeMimeWords = (value: string) =>
	value.replace(/\?=\s+=\?/g, '?==?').replace(/=\?([^?]+)\?([BQ])\?([^?]*)\?=/gi, decodeWord)

export const displayNameOf = (header: string | undefined) => {
	const name = header?.match(/^\s*(.*?)\s*<[^>]*>\s*$/)?.[1]

	if (!name) {
		return null
	}

	return (
		decodeMimeWords(name)
			.replace(/^"(.*)"$/, '$1')
			.trim() || null
	)
}

export const truncateText = (text: string, max: number) => {
	if (text.length <= max) {
		return text
	}

	const cut = text.slice(0, max)
	const space = cut.lastIndexOf(' ')

	return `${space > max * 0.8 ? cut.slice(0, space) : cut}…`
}
