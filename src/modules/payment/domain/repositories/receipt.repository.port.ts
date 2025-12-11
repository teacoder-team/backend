import { ReceiptEntity } from '../entities/receipt.entity'

export abstract class ReceiptRepositoryPort {
	public abstract save(receipt: ReceiptEntity): Promise<void>
	public abstract update(receipt: ReceiptEntity): Promise<void>
	public abstract findByPaymentId(
		paymentId: string
	): Promise<ReceiptEntity | null>
}
