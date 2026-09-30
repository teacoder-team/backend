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
