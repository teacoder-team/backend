export interface SubscriptionEntity {
	id: string
	userId: string
	startedAt: Date
	expiresAt: Date
}

export abstract class SubscriptionRepositoryPort {
	public abstract extendSubscription(
		userId: string
	): Promise<SubscriptionEntity>
}
