import type { Prisma } from '@prisma/generated/client'

import { db } from '~/lib/db'

export const listPublishedCourses = () =>
	db.course.findMany({
		where: { isPublished: true },
		select: {
			id: true,
			title: true,
			slug: true,
			shortDescription: true,
			thumbnail: true,
			price: true,
			accessMode: true,
			attachment: true,
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
			accessMode: true,
			attachment: true,
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
			description: true,
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

export const findCourseSummary = (courseId: string) =>
	db.course.findUnique({
		where: { id: courseId },
		select: { title: true, slug: true, thumbnail: true }
	})

export const findCoursePurchase = (
	userId: string,
	courseId: string,
	client: Prisma.TransactionClient = db
) =>
	client.coursePurchase.findUnique({
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

export const createCoursePurchase = (
	data: NewCoursePurchase,
	client: Prisma.TransactionClient = db
) => client.coursePurchase.create({ data })

export const findCourseAttachment = (courseId: string) =>
	db.course.findFirst({
		where: { id: courseId, isPublished: true, attachment: { not: null } },
		select: { slug: true, attachment: true }
	})

export interface NewDownloadLog {
	token: string
	userId: string
	courseId: string
	ip: string
	userAgent: string
}

export const logCourseDownload = (data: NewDownloadLog) => db.downloadLog.create({ data })
