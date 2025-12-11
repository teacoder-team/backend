export class MoneyVO {
	private constructor(
		public readonly value: number,
		public readonly currency: string
	) {}

	public static create(value: number, currency: string = 'RUB') {
		return new MoneyVO(value, currency)
	}
}
