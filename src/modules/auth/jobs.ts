import { env } from '~/config/env'
import { sendMail } from '~/lib/mail/client'
import EmailChange from '~/lib/mail/templates/EmailChange'
import EmailVerification from '~/lib/mail/templates/EmailVerification'
import PasswordChange from '~/lib/mail/templates/PasswordChange'
import ResetPassword from '~/lib/mail/templates/ResetPassword'
import { emailQueue } from '~/lib/queue/queues'
import type { JobHandlers } from '~/lib/queue/runner'
import { issueEmailToken } from '~/lib/security/email-token'

import { findEmailVerificationTarget } from './repository'

export type EmailJobs = {
	sendEmailVerificationLink: { userId: string }
	sendPasswordResetLink: { email: string; url: string }
	sendEmailChangeCode: { email: string; code: string }
	sendPasswordChangeCode: { email: string; code: string }
}

export const emailJobs: JobHandlers<EmailJobs> = {
	sendEmailVerificationLink: async ({ userId }) => {
		const user = await findEmailVerificationTarget(userId)

		if (!user?.email || user.emailVerifiedAt) {
			return
		}

		const token = await issueEmailToken('email-verification', { userId, email: user.email })
		const url = `${env.APP_URL}/auth/verify/${token}`

		await sendMail({
			to: user.email,
			subject: 'Подтвердите почту TeaCoder',
			template: EmailVerification({ url, username: user.displayName }),
			sender: 'hello'
		})
	},
	sendPasswordResetLink: async ({ email, url }) => {
		await sendMail({
			to: email,
			subject: 'Сброс пароля TeaCoder',
			template: ResetPassword({ url }),
			sender: 'hello'
		})
	},
	sendEmailChangeCode: async ({ email, code }) => {
		await sendMail({
			to: email,
			subject: `${code} - код подтверждения почты TeaCoder`,
			template: EmailChange({ code }),
			sender: 'hello'
		})
	},
	sendPasswordChangeCode: async ({ email, code }) => {
		await sendMail({
			to: email,
			subject: `${code} - код смены пароля TeaCoder`,
			template: PasswordChange({ code }),
			sender: 'hello'
		})
	}
}

export const enqueueEmailVerificationLink = (payload: EmailJobs['sendEmailVerificationLink']) =>
	emailQueue.add('sendEmailVerificationLink', payload)

export const enqueuePasswordResetLink = (payload: EmailJobs['sendPasswordResetLink']) =>
	emailQueue.add('sendPasswordResetLink', payload)

export const enqueueEmailChangeCode = (payload: EmailJobs['sendEmailChangeCode']) =>
	emailQueue.add('sendEmailChangeCode', payload)

export const enqueuePasswordChangeCode = (payload: EmailJobs['sendPasswordChangeCode']) =>
	emailQueue.add('sendPasswordChangeCode', payload)
