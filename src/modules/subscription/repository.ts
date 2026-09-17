import { db } from '~/infra/db'

export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
	const subscription = await db.subscription.findUnique({ where: { userId } })

	if (!subscription?.isActive) return false

	return !subscription.expiresAt || subscription.expiresAt > new Date()
}

export const cancelSubscription = async (userId: string) => {
	const subscription = await db.subscription.findUnique({ where: { userId } })

	if (!subscription?.isActive) return null

	return db.subscription.update({
		where: { userId },
		data: {
			isAutoBilling: false,
			...(subscription.expiresAt ? {} : { isActive: false })
		}
	})
}
