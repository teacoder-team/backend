export class Slug {
	public readonly value: string

	constructor(value: string) {
		if (!value || value.trim().length === 0) {
			throw new Error('Slug cannot be empty')
		}
		this.value = value.toLowerCase()
	}

	toString() {
		return this.value
	}
}
