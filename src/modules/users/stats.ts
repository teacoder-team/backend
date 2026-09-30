import { cache } from '~/lib/cache'
import { NotFoundError } from '~/lib/errors'

import {
	countLessonsPerCourse,
	countUsersAhead,
	findCoursesWithLessons,
	findUserPoints,
	listCompletedLessons,
	listLeaders,
	listProgressActivity
} from './repository'

const LEADERS_LIMIT = 15
const LEADERS_CACHE_TTL = 60
const LEADERS_CACHE_KEY = 'users:leaders'

const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0)

export const getStatistics = async (userId: string) => {
	const [user, lessonsPerCourse, completed] = await Promise.all([
		findUserPoints(userId),
		countLessonsPerCourse(),
		listCompletedLessons(userId)
	])

	if (!user) {
		throw new NotFoundError('User not found')
	}

	const completedPerCourse = new Map<string, number>()

	for (const { lesson } of completed) {
		completedPerCourse.set(lesson.courseId, (completedPerCourse.get(lesson.courseId) ?? 0) + 1)
	}

	const totalPerCourse = new Map(lessonsPerCourse.map((row) => [row.courseId, row._count._all]))
	const totalLessons = lessonsPerCourse.reduce((sum, row) => sum + row._count._all, 0)

	let completedCourses = 0
	let coursesInProgress = 0

	for (const [courseId, done] of completedPerCourse) {
		if (done >= (totalPerCourse.get(courseId) ?? 0)) {
			completedCourses++
		} else {
			coursesInProgress++
		}
	}

	return {
		points: user.points,
		rank: (await countUsersAhead(user.points)) + 1,
		completedLessons: completed.length,
		totalLessons,
		progress: percent(completed.length, totalLessons),
		completedCourses,
		coursesInProgress
	}
}

/** Courses the user has finished at least one lesson in, most recently studied first. */
export const getCourseProgress = async (userId: string) => {
	const activity = await listProgressActivity(userId)
	const completedIds = new Set(activity.filter((row) => row.isCompleted).map((row) => row.lessonId))
	const lastActivity = new Map<string, Date>()

	for (const row of activity) {
		const seen = lastActivity.get(row.lesson.courseId)

		if (!seen || row.updatedAt > seen) {
			lastActivity.set(row.lesson.courseId, row.updatedAt)
		}
	}

	const startedCourseIds = [
		...new Set(activity.filter((row) => row.isCompleted).map((row) => row.lesson.courseId))
	]
	const courses = await findCoursesWithLessons(startedCourseIds)

	return courses
		.map(({ lessons, ...course }) => {
			const completedLessons = lessons.filter((lesson) => completedIds.has(lesson.id)).length
			const nextLesson = lessons.find((lesson) => !completedIds.has(lesson.id)) ?? null

			return {
				...course,
				totalLessons: lessons.length,
				completedLessons,
				progress: percent(completedLessons, lessons.length),
				nextLesson,
				lastActivityAt: lastActivity.get(course.id)?.toISOString() ?? null
			}
		})
		.sort((a, b) => (b.lastActivityAt ?? '').localeCompare(a.lastActivityAt ?? ''))
}

const isPremium = (subscription: { isActive: boolean; expiresAt: Date | null } | null) =>
	Boolean(subscription?.isActive) &&
	(!subscription?.expiresAt || subscription.expiresAt > new Date())

/** Public and identical for everyone - cached briefly instead of hitting the table per visitor. */
export const getLeaders = async () =>
	(await cache.readThrough(LEADERS_CACHE_KEY, { ttl: LEADERS_CACHE_TTL }, async () => {
		const leaders = await listLeaders(LEADERS_LIMIT)

		/** Same points, same place - matches `rank` in the user's own statistics. */
		return leaders.map(({ subscription, ...user }) => ({
			...user,
			rank: leaders.findIndex((leader) => leader.points === user.points) + 1,
			isPremium: isPremium(subscription)
		}))
	})) ?? []
