import { Inject, Injectable } from '@nestjs/common'
import { addMonths } from 'date-fns'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { DRIZZLE_DB } from '@/infra/database/drizzle/drizzle.provider'
import { subscriptions } from '@/infra/database/drizzle/schema'

import { SubscriptionRepositoryPort } from '../../domain/repositories/subscription.repository.port'

@Injectable()
export class SubscriptionRepositoryAdapter
	implements SubscriptionRepositoryPort
{
	public constructor(
		@Inject(DRIZZLE_DB)
		private readonly db: NodePgDatabase
	) {}

	public async extendSubscription(userId: string) {
		const now = new Date()

		return this.db.transaction(async tx => {
			const [existing] = await tx
				.select()
				.from(subscriptions)
				.where(eq(subscriptions.userId, userId))
				.limit(1)

			const baseDate =
				existing?.expiresAt && existing.expiresAt > now
					? existing.expiresAt
					: now

			const newExpiresAt = addMonths(baseDate, 1)

			if (existing) {
				const [updated] = await tx
					.update(subscriptions)
					.set({
						expiresAt: newExpiresAt,
						isActive: true,
						updatedAt: new Date()
					})
					.where(eq(subscriptions.userId, userId))
					.returning()

				return updated
			}

			const [created] = await tx
				.insert(subscriptions)
				.values({
					userId,
					startedAt: now,
					expiresAt: newExpiresAt,
					isActive: true
				})
				.returning()

			return created
		})
	}
}
