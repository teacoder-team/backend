import { env } from '~/config/env'
import { sendMail } from '~/lib/mail/client'
import CoursePurchase from '~/lib/mail/templates/CoursePurchase'
import { emailQueue } from '~/lib/queue/queues'
import type { JobHandlers } from '~/lib/queue/runner'
import { getUserEmail } from '~/modules/auth/service'
import { findUserById } from '~/modules/users/repository'

import { findCourseSummary } from './repository'

/** Ids only - the address is decrypted at send time rather than parked in Redis. */
export type CourseEmailJobs = {
	sendCoursePurchase: { userId: string; courseId: string }
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
				courseThumbnail: course.thumbnail,
				courseUrl: `${env.APP_URL}/courses/${course.slug}`
			}),
			sender: 'noreply'
		})
	}
}

export const enqueueCoursePurchaseEmail = (payload: CourseEmailJobs['sendCoursePurchase']) =>
	emailQueue.add('sendCoursePurchase', payload)
