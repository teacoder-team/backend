import { Injectable } from '@nestjs/common'
import { addMonths } from 'date-fns'
import { eq } from 'drizzle-orm'

import { DatabaseService } from '@/infra/database/database.service'
import { subscriptions } from '@/infra/database/drizzle/schema'

import { SubscriptionRepositoryPort } from '../../domain/repositories/subscription.repository.port'

@Injectable()
export class SubscriptionRepositoryAdapter
	implements SubscriptionRepositoryPort
{
	public constructor(private readonly db: DatabaseService) {}

	public async extendSubscription(userId: string) {
		const now = new Date()

		const [existing] = await this.db.db
			.select()
			.from(subscriptions)
			.where(eq(subscriptions.userId, userId))
			.limit(1)

		let newExpiresAt =
			existing?.expiresAt && existing.expiresAt > now
				? existing.expiresAt
				: now

		newExpiresAt = addMonths(newExpiresAt, 1)

		if (existing) {
			await this.db.db
				.update(subscriptions)
				.set({
					updatedAt: new Date(),
					expiresAt: newExpiresAt,
					isActive: true
				})
				.where(eq(subscriptions.userId, userId))
		} else {
			await this.db.db.insert(subscriptions).values({
				userId,
				startedAt: now,
				expiresAt: newExpiresAt,
				isActive: true
			})
		}

		return {
			id: existing.id,
			userId,
			startedAt: existing.startedAt,
			expiresAt: newExpiresAt
		}
	}
}
