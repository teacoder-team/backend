import { CourseAccessMode, CourseStage, type Prisma } from '@prisma/generated/client'

import { db } from '~/lib/db'
import { PREMIUM_ACCESS_MODES } from '~/modules/course/model'

const releasedOrAnnounced = {
	OR: [{ isPublished: true }, { isAnnounced: true }]
} satisfies Prisma.LessonWhereInput

const lessonReleaseFlags = {
	where: releasedOrAnnounced,
	select: { isPublished: true }
} as const

const courseListSelect = {
	id: true,
	title: true,
	slug: true,
	shortDescription: true,
	thumbnail: true,
	price: true,
	discountPrice: true,
	accessMode: true,
	isPublished: true,
	stage: true,
	youtubeUrl: true,
	attachment: true,
	lessons: lessonReleaseFlags
} satisfies Prisma.CourseSelect

export const listPublishedCourses = () =>
	db.course.findMany({
		where: { isPublished: true, stage: { not: CourseStage.ARCHIVED } },
		select: courseListSelect,
		orderBy: { createdAt: 'desc' }
	})

export const listLibraryCourses = (userId: string, hasPremium: boolean) =>
	db.course.findMany({
		where: {
			isPublished: true,
			accessMode: { not: CourseAccessMode.FREE },
			OR: [
				{ purchases: { some: { userId } } },
				...(hasPremium ? [{ accessMode: { in: PREMIUM_ACCESS_MODES } }] : [])
			]
		},
		select: courseListSelect,
		orderBy: [{ createdAt: 'desc' }, { id: 'asc' }]
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
			discountPrice: true,
			learningOutcomes: true,
			accessMode: true,
			isPublished: true,
			stage: true,
			attachment: true,
			views: true,
			lessons: lessonReleaseFlags
		}
	})

export const incrementCourseViews = (id: string) =>
	db.course.update({ where: { id }, data: { views: { increment: 1 } } })

export const findPublishedCourseProgram = (slug: string) =>
	db.course.findFirst({
		where: { slug, isPublished: true },
		select: {
			sections: {
				select: {
					id: true,
					title: true,
					position: true,
					lessons: {
						where: releasedOrAnnounced,
						select: {
							id: true,
							title: true,
							slug: true,
							isPublished: true,
							plannedReleaseAt: true
						},
						orderBy: [{ position: 'asc' }, { id: 'asc' }]
					}
				}
			},
			lessons: {
				where: { ...releasedOrAnnounced, sectionId: null },
				select: {
					id: true,
					title: true,
					slug: true,
					position: true,
					isPublished: true,
					plannedReleaseAt: true
				}
			}
		}
	})

export const findCourseForPurchase = (courseId: string) =>
	db.course.findUnique({
		where: { id: courseId },
		select: {
			id: true,
			title: true,
			price: true,
			discountPrice: true,
			isPublished: true,
			stage: true,
			accessMode: true
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
