import { db } from '~/infra/db'

export const listPublishedCourses = () =>
	db.course.findMany({
		where: { isPublished: true },
		select: {
			id: true,
			title: true,
			slug: true,
			shortDescription: true,
			thumbnail: true,
			_count: { select: { lessons: { where: { isPublished: true } } } }
		},
		orderBy: { createdAt: 'desc' }
	})

export const findPublishedCourseBySlug = (slug: string) =>
	db.course.findFirst({
		where: { slug, isPublished: true },
		select: {
			id: true,
			title: true,
			slug: true,
			shortDescription: true,
			fullDescription: true,
			thumbnail: true,
			youtubeUrl: true,
			price: true,
			views: true
		}
	})

export const incrementCourseViews = (id: string) =>
	db.course.update({ where: { id }, data: { views: { increment: 1 } } })

export const findPublishedLessonsForCourse = (courseId: string) =>
	db.lesson.findMany({
		where: { courseId, isPublished: true },
		select: {
			id: true,
			title: true,
			slug: true,
			position: true,
			access: true
		},
		orderBy: { position: 'asc' }
	})

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
