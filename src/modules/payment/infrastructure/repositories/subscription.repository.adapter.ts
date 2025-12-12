import { Injectable } from '@nestjs/common'
import { addMonths } from 'date-fns'

import { PrismaService } from '@/infra/prisma/prisma.service'

import { SubscriptionRepositoryPort } from '../../domain/repositories/subscription.repository.port'

@Injectable()
export class SubscriptionRepositoryAdapter
	implements SubscriptionRepositoryPort
{
	public constructor(private readonly prisma: PrismaService) {}

	public async extendSubscription(userId: string) {
		const now = new Date()

		const existing = await this.prisma.subscription.findUnique({
			where: { userId }
		})

		let startedAt = existing?.startedAt ?? now

		let baseDate =
			existing?.expiresAt && existing.expiresAt > now
				? existing.expiresAt
				: now

		const newExpiresAt = addMonths(baseDate, 1)

		if (existing) {
			const updated = await this.prisma.subscription.update({
				where: { userId },
				data: {
					expiresAt: newExpiresAt,
					isActive: true,
					updatedAt: new Date()
				}
			})

			return updated
		}

		const created = await this.prisma.subscription.create({
			data: {
				userId,
				startedAt,
				expiresAt: newExpiresAt,
				isActive: true
			}
		})

		return created
	}
}
