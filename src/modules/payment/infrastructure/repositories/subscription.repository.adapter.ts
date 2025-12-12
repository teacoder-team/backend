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

		let startedAt = existing?.startedAt ?? now

		let baseDate =
			existing?.expiresAt && existing.expiresAt > now
				? existing.expiresAt
				: now

		const newExpiresAt = addMonths(baseDate, 1)

		if (existing) {
			const [row] = await this.db.db
				.update(subscriptions)
				.set({
					expiresAt: newExpiresAt,
					isActive: true,
					updatedAt: new Date()
				})
				.where(eq(subscriptions.userId, userId))
				.returning()

			return row
		}

		const [row] = await this.db.db
			.insert(subscriptions)
			.values({
				userId,
				startedAt,
				expiresAt: newExpiresAt,
				isActive: true
			})
			.returning()

		return row
	}
}
