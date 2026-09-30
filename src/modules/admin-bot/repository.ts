import { db } from '~/lib/db'

export const findPurchaseDetails = (paymentId: string) =>
	db.paymentIntent.findUnique({
		where: { id: paymentId },
		select: {
			id: true,
			amount: true,
			currency: true,
			method: true,
			provider: true,
			pspIntentId: true,
			invoiceNumber: true,
			courseId: true,
			createdAt: true,
			updatedAt: true,
			user: {
				select: {
					id: true,
					displayName: true,
					role: true,
					createdAt: true,
					lastLoginAt: true,
					passwordCredential: { select: { userId: true } },
					oauthAccounts: { select: { provider: true } },
					_count: { select: { coursePurchases: true } }
				}
			}
		}
	})

export type PurchaseDetails = NonNullable<Awaited<ReturnType<typeof findPurchaseDetails>>>

export const findPurchasedCourse = (courseId: string) =>
	db.course.findUnique({
		where: { id: courseId },
		select: { title: true, slug: true, price: true }
	})

export type PurchasedCourse = NonNullable<Awaited<ReturnType<typeof findPurchasedCourse>>>

export const findRegistrationDetails = (userId: string) =>
	db.user.findUnique({
		where: { id: userId },
		select: {
			displayName: true,
			createdAt: true,
			sessions: {
				orderBy: { createdAt: 'desc' },
				take: 1,
				select: {
					ip: true,
					country: true,
					city: true,
					os: true,
					browser: true,
					device: true,
					visitorId: true,
					createdAt: true
				}
			}
		}
	})

export type RegistrationDetails = NonNullable<Awaited<ReturnType<typeof findRegistrationDetails>>>

export const findAccountsOnVisitor = async (visitorId: string, excludeUserId: string) => {
	const visitors = await db.userVisitor.findMany({
		where: { visitorId, userId: { not: excludeUserId } },
		orderBy: { firstSeenAt: 'asc' },
		select: { user: { select: { displayName: true, username: true } } }
	})

	return visitors.map(({ user }) => user)
}

export type VisitorAccount = Awaited<ReturnType<typeof findAccountsOnVisitor>>[number]
