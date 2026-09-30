/** Markup that is already safe for Telegram's HTML parse mode. Build it with the `html` tag. */
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

/**
 * Tagged template for Telegram HTML. Interpolated values are escaped unless they are
 * `Html` themselves, so nested templates compose and user input can't break the markup.
 * `false`/`null`/`undefined` render as nothing - handy for `${condition && tg`...`}`.
 *
 * Deliberately not named `html`: prettier formats `html` templates as HTML, collapsing the
 * newlines that Telegram renders literally.
 */
export const tg = (strings: TemplateStringsArray, ...values: HtmlValue[]) =>
	new Html(strings.reduce((out, chunk, index) => out + render(values[index - 1]) + chunk))

/** Joins fragments with a separator, skipping empty ones. */
export const joinHtml = (parts: readonly HtmlValue[], separator: HtmlValue = '\n') => {
	const rendered = parts.map(render).filter(Boolean)

	return new Html(rendered.join(render(separator)))
}
