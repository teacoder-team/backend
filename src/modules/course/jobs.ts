import { env } from '~/config/env'
import { orionUrl } from '~/lib/integrations/orion'
import { logger } from '~/lib/logger'
import { sendMail } from '~/lib/mail/client'
import CourseLessonsReleased from '~/lib/mail/templates/CourseLessonsReleased'
import CoursePurchase from '~/lib/mail/templates/CoursePurchase'
import { emailQueue, maintenanceQueue } from '~/lib/queue/queues'
import type { JobHandlers } from '~/lib/queue/runner'
import { enqueueLessonsReleasedNotification } from '~/modules/admin-bot/service'
import { getUserEmail } from '~/modules/auth/service'
import { findUserById } from '~/modules/users/repository'

import {
	findCourseSummary,
	findReleasedLessons,
	listCourseBuyerIds,
	listCourseTitles,
	listPendingLessonReleases,
	publishDueLessons
} from './repository'

export type CourseEmailJobs = {
	sendCoursePurchase: { userId: string; courseId: string }
	sendCourseLessonsReleased: { userId: string; courseId: string; lessonIds: string[] }
}

export const courseEmailJobs: JobHandlers<CourseEmailJobs> = {
	sendCoursePurchase: async ({ userId, courseId }) => {
		const [email, user, course] = await Promise.all([
			getUserEmail(userId),
			findUserById(userId),
			findCourseSummary(courseId)
		])

		if (!email || !user || !course) {
			return
		}

		await sendMail({
			to: email,
			subject: `Курс «${course.title}» открыт - TeaCoder`,
			template: CoursePurchase({
				username: user.displayName,
				courseTitle: course.title,
				courseThumbnail: orionUrl('courses', course.thumbnail) ?? undefined,
				courseUrl: `${env.APP_URL}/courses/${course.slug}`
			}),
			sender: 'noreply'
		})
	},

	sendCourseLessonsReleased: async ({ userId, courseId, lessonIds }) => {
		const [email, user, course, lessons] = await Promise.all([
			getUserEmail(userId),
			findUserById(userId),
			findCourseSummary(courseId),
			findReleasedLessons(courseId, lessonIds)
		])

		if (!email || !user || !course || lessons.length === 0) {
			return
		}

		const isSingle = lessons.length === 1

		await sendMail({
			to: email,
			subject: `${isSingle ? 'Новый урок' : 'Новые уроки'} в курсе «${course.title}» - TeaCoder`,
			template: CourseLessonsReleased({
				username: user.displayName,
				courseTitle: course.title,
				courseThumbnail: orionUrl('courses', course.thumbnail) ?? undefined,
				courseUrl: `${env.APP_URL}/courses/${course.slug}`,
				lessons: lessons.map((lesson) => lesson.title)
			}),
			sender: 'noreply'
		})
	}
}

export const enqueueCoursePurchaseEmail = (payload: CourseEmailJobs['sendCoursePurchase']) =>
	emailQueue.add('sendCoursePurchase', payload)

const enqueueLessonsReleasedEmails = (payloads: CourseEmailJobs['sendCourseLessonsReleased'][]) =>
	emailQueue.addBulk(payloads.map((data) => ({ name: 'sendCourseLessonsReleased', data })))

export type CourseReleaseJobs = {
	publishLessonRelease: { courseId: string; releaseAt: string }
}

export const courseReleaseJobs: JobHandlers<CourseReleaseJobs> = {
	publishLessonRelease: async ({ courseId, releaseAt }) => {
		const released = await publishDueLessons(courseId, new Date(releaseAt))

		if (released.length === 0) {
			return
		}

		const lessonIds = released.map((lesson) => lesson.id)
		const buyers = await listCourseBuyerIds(courseId)

		logger.info(
			{
				context: 'course',
				courseId,
				lessons: lessonIds.length,
				recipients: buyers.length
			},
			'lessons_released'
		)

		if (buyers.length > 0) {
			await enqueueLessonsReleasedEmails(
				buyers.map((userId) => ({ userId, courseId, lessonIds }))
			).catch((err: unknown) => {
				logger.error(
					{ context: 'course', courseId, err },
					'lessons_released_emails_enqueue_failed'
				)
			})
		}

		await enqueueLessonsReleasedNotification({
			courseId,
			lessonIds,
			recipients: buyers.length
		})
	}
}

const releaseJobId = (courseId: string, releaseAt: Date) =>
	`lesson-release-${courseId}-${releaseAt.getTime()}`

export const syncLessonReleases = async () => {
	const groups = await listPendingLessonReleases()
	const pending = groups.flatMap((group) =>
		group.plannedReleaseAt ? [{ ...group, plannedReleaseAt: group.plannedReleaseAt }] : []
	)
	const courses = await listCourseTitles([...new Set(pending.map((group) => group.courseId))])
	const titles = new Map(courses.map((course) => [course.id, course.title]))
	const now = Date.now()

	const releases = []

	for (const group of pending) {
		const { courseId, plannedReleaseAt } = group
		const delay = Math.max(plannedReleaseAt.getTime() - now, 0)

		await maintenanceQueue.add(
			'publishLessonRelease',
			{ courseId, releaseAt: plannedReleaseAt.toISOString() },
			{ jobId: releaseJobId(courseId, plannedReleaseAt), delay }
		)

		releases.push({
			courseId,
			courseTitle: titles.get(courseId) ?? null,
			releaseAt: plannedReleaseAt.toISOString(),
			lessons: group._count._all,
			isDue: delay === 0
		})
	}

	logger.info({ context: 'course', releases: releases.length }, 'lesson_releases_synced')

	return {
		releases,
		scheduled: releases.length,
		lessons: releases.reduce((total, release) => total + release.lessons, 0),
		dueNow: releases.filter((release) => release.isDue).length
	}
}
