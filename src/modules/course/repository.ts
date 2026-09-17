import { db } from '~/infra/db'

export const findPurchasableCourse = (courseId: string) =>
	db.course.findFirst({
		where: {
			id: courseId,
			isPublished: true,
			price: {
				not: null
			}
		},
		select: {
			id: true,
			title: true,
			price: true
		}
	})

export const findCoursePurchase = (userId: string, courseId: string) =>
	db.coursePurchase.findUnique({
		where: { userId_courseId: { userId, courseId } }
	})

export interface NewCoursePurchase {
	userId: string
	courseId: string
	/** Frozen at what was actually paid - Course.price can move later. */
	pricePaid: number
	currency: string
	paymentId?: string
}

export const createCoursePurchase = (data: NewCoursePurchase) => db.coursePurchase.create({ data })
