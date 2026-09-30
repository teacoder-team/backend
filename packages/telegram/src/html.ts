export class Html {
	constructor(readonly value: string) {}

	toString() {
		return this.value
	}
}

export type HtmlValue = Html | string | number | boolean | null | undefined | readonly HtmlValue[]

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }

export const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (char) => ENTITIES[char]!)

const render = (value: HtmlValue): string => {
	if (value instanceof Html) {
		return value.value
	}

	if (Array.isArray(value)) {
		return value.map(render).join('')
	}

	if (value === null || value === undefined || value === false || value === true) {
		return ''
	}

	return escapeHtml(String(value))
}

export const tg = (strings: TemplateStringsArray, ...values: HtmlValue[]) =>
	new Html(strings.reduce((out, chunk, index) => out + render(values[index - 1]) + chunk))

export const customEmoji = (id: string, fallback: string) =>
	tg`<tg-emoji emoji-id="${id}">${fallback}</tg-emoji>`

export const joinHtml = (parts: readonly HtmlValue[], separator: HtmlValue = '\n') => {
	const rendered = parts.map(render).filter(Boolean)

	return new Html(rendered.join(render(separator)))
}
