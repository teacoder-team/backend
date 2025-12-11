export class PaymentStatusVO {
	private constructor(
		public readonly value: 'PENDING' | 'SUCCESS' | 'FAILED'
	) {}

	public static pending() {
		return new PaymentStatusVO('PENDING')
	}
	public static success() {
		return new PaymentStatusVO('SUCCESS')
	}
	public static failed() {
		return new PaymentStatusVO('FAILED')
	}
}
