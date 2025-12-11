export class PaymentMethodVO {
	private constructor(public readonly value: string) {}

	public static create(value: string) {
		return new PaymentMethodVO(value)
	}
}
