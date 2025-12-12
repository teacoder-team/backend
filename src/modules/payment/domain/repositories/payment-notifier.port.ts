import { PaymentEntity } from '../entities/payment.entity'

import { SubscriptionEntity } from './subscription.repository.port'
import { UserEntity } from './user.repository.port'

export abstract class PaymentNotifierPort {
	public abstract notifySuccess(
		user: UserEntity,
		payment: PaymentEntity,
		subscription: SubscriptionEntity
	): Promise<void>
}
