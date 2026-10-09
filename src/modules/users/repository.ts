import { RestrictionStatus } from '@prisma/generated/client'

import { db } from '~/lib/db'

export const findUserById = (userId: string) =>
	db.user.findUnique({
		where: { id: userId },
		include: { passwordCredential: { select: { userId: true } } }
	})

export const updateAvatar = (userId: string, avatarUrl: string) =>
	db.user.update({ where: { id: userId }, data: { avatar: avatarUrl } })

export const updateDisplayName = (userId: string, displayName: string) =>
	db.user.update({ where: { id: userId }, data: { displayName } })

const reachableLesson = { isPublished: true, course: { isPublished: true } } as const

const notBanned = (now: Date) => ({
	restrictions: {
		none: { status: RestrictionStatus.ACTIVE, OR: [{ until: null }, { until: { gt: now } }] }
	}
})

export const countLessonsPerCourse = () =>
	db.lesson.groupBy({ by: ['courseId'], where: reachableLesson, _count: { _all: true } })

export const listCompletedLessons = (userId: string) =>
	db.userProgress.findMany({
		where: { userId, isCompleted: true, lesson: reachableLesson },
		select: { lesson: { select: { courseId: true } } }
	})

export const findUserPoints = (userId: string) =>
	db.user.findUnique({ where: { id: userId }, select: { points: true } })

export const countUsersAhead = (points: number) =>
	db.user.count({ where: { points: { gt: points }, ...notBanned(new Date()) } })

export const listProgressActivity = (userId: string) =>
	db.userProgress.findMany({
		where: { userId, lesson: reachableLesson },
		select: {
			lessonId: true,
			isCompleted: true,
			updatedAt: true,
			lesson: { select: { courseId: true } }
		}
	})

export const findCoursesWithLessons = (courseIds: string[]) =>
	db.course.findMany({
		where: { id: { in: courseIds }, isPublished: true },
		select: {
			id: true,
			title: true,
			slug: true,
			thumbnail: true,
			lessons: {
				where: { isPublished: true },
				orderBy: { position: 'asc' },
				select: { id: true, title: true, slug: true, position: true }
			}
		}
	})

export const listLeaders = (limit: number) =>
	db.user.findMany({
		where: notBanned(new Date()),
		orderBy: [{ points: 'desc' }, { createdAt: 'asc' }],
		take: limit,
		select: {
			id: true,
			displayName: true,
			avatar: true,
			points: true,
			subscription: { select: { isActive: true, expiresAt: true } }
		}
	})
