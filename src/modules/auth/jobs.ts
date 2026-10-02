import { sendMail } from '~/lib/mail/client'
import EmailChange from '~/lib/mail/templates/EmailChange'
import PasswordChange from '~/lib/mail/templates/PasswordChange'
import ResetPassword from '~/lib/mail/templates/ResetPassword'
import VerificationCode from '~/lib/mail/templates/VerificationCode'
import { emailQueue } from '~/lib/queue/queues'
import type { JobHandlers } from '~/lib/queue/runner'

export type EmailJobs = {
	sendVerificationCode: { email: string; code: string }
	sendPasswordResetLink: { email: string; url: string }
	sendEmailChangeCode: { email: string; code: string }
	sendPasswordChangeCode: { email: string; code: string }
}

export const emailJobs: JobHandlers<EmailJobs> = {
	sendVerificationCode: async ({ email, code }) => {
		await sendMail({
			to: email,
			subject: `${code} - код подтверждения TeaCoder`,
			template: VerificationCode({ code }),
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

export const enqueueVerificationCode = (payload: EmailJobs['sendVerificationCode']) =>
	emailQueue.add('sendVerificationCode', payload)

export const enqueuePasswordResetLink = (payload: EmailJobs['sendPasswordResetLink']) =>
	emailQueue.add('sendPasswordResetLink', payload)

export const enqueueEmailChangeCode = (payload: EmailJobs['sendEmailChangeCode']) =>
	emailQueue.add('sendEmailChangeCode', payload)

export const enqueuePasswordChangeCode = (payload: EmailJobs['sendPasswordChangeCode']) =>
	emailQueue.add('sendPasswordChangeCode', payload)
