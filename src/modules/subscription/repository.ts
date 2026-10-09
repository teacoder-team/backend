import { db } from '~/lib/db'

export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
	const active = await db.subscription.count({
		where: { userId, isActive: true, expiresAt: { gt: new Date() } }
	})

	return active > 0
}

export const cancelSubscription = async (userId: string) => {
	const subscription = await db.subscription.findUnique({ where: { userId } })

	if (!subscription?.isActive) {
		return null
	}

	return db.subscription.update({
		where: { userId },
		data: { isAutoBilling: false }
	})
}

export const findSubscription = (userId: string) =>
	db.subscription.findUnique({
		where: { userId },
		select: { isActive: true, isAutoBilling: true, startedAt: true, expiresAt: true }
	})

export const setAutoBilling = (userId: string, isAutoBilling: boolean) =>
	db.subscription.update({
		where: { userId },
		data: { isAutoBilling },
		select: { isActive: true, isAutoBilling: true, startedAt: true, expiresAt: true }
	})

export const findSubscriptionMailTarget = (userId: string) =>
	db.user.findUnique({
		where: { id: userId },
		select: { displayName: true, subscription: { select: { expiresAt: true } } }
	})

export const findDueRenewals = (after: Date, until: Date) =>
	db.subscription.findMany({
		where: { isActive: true, isAutoBilling: true, expiresAt: { gt: after, lte: until } },
		select: { id: true, expiresAt: true }
	})

export const findLapsedSubscriptions = (now: Date, giveUpBefore: Date) =>
	db.subscription.findMany({
		where: {
			isActive: true,
			OR: [
				{ isAutoBilling: false, expiresAt: { lte: now } },
				{ isAutoBilling: true, expiresAt: { lte: giveUpBefore } }
			]
		},
		select: { id: true, userId: true, isAutoBilling: true, expiresAt: true }
	})

export const findSubscriptionsEndingBetween = (from: Date, to: Date) =>
	db.subscription.findMany({
		where: { isActive: true, expiresAt: { gte: from, lt: to } },
		select: { id: true, userId: true, isAutoBilling: true, expiresAt: true }
	})

export const findSubscriptionById = (id: string) =>
	db.subscription.findUnique({
		where: { id },
		select: { id: true, userId: true, isActive: true, isAutoBilling: true, expiresAt: true }
	})

export const endSubscriptionPeriod = async (id: string, expiresAt: Date) => {
	const { count } = await db.subscription.updateMany({
		where: { id, isActive: true, expiresAt },
		data: { isActive: false, isAutoBilling: false }
	})

	return count === 1
}

export const findRenewalMailTarget = (userId: string) =>
	db.user.findUnique({
		where: { id: userId },
		select: {
			displayName: true,
			subscription: { select: { isActive: true, isAutoBilling: true, expiresAt: true } }
		}
	})

export const findRenewalReceipt = (paymentId: string) =>
	db.paymentIntent.findUnique({
		where: { id: paymentId },
		select: {
			amount: true,
			currency: true,
			user: {
				select: {
					id: true,
					displayName: true,
					subscription: { select: { expiresAt: true } }
				}
			}
		}
	})
