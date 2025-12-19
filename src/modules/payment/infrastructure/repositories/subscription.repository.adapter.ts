import { Inject, Injectable } from '@nestjs/common'
import { addMonths } from 'date-fns'
import { sql } from 'drizzle-orm'
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

		const [row] = await this.db
			.insert(subscriptions)
			.values({
				userId,
				startedAt: now,
				expiresAt: addMonths(now, 1),
				isActive: true
			})
			.onConflictDoUpdate({
				target: subscriptions.userId,
				set: {
					expiresAt: sql`
						CASE
							WHEN ${subscriptions.expiresAt} > now()
								THEN ${subscriptions.expiresAt} + interval '1 month'
							ELSE now() + interval '1 month'
						END
					`,
					isActive: true,
					updatedAt: new Date()
				}
			})
			.returning()

		return row
	}
}
