import { sendMail } from '~/infra/mail/client'
import EmailChange from '~/infra/mail/templates/EmailChange'
import PasswordChange from '~/infra/mail/templates/PasswordChange'
import ResetPassword from '~/infra/mail/templates/ResetPassword'
import VerificationCode from '~/infra/mail/templates/VerificationCode'
import { emailQueue } from '~/infra/queue/queues'
import type { JobHandlers } from '~/infra/queue/runner'

export type EmailJobs = {
	sendVerificationCode: { email: string; code: string }
	sendPasswordResetCode: { email: string; code: string }
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
	sendPasswordResetCode: async ({ email, code }) => {
		await sendMail({
			to: email,
			subject: `${code} - код сброса пароля TeaCoder`,
			template: ResetPassword({ code }),
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

export const enqueuePasswordResetCode = (payload: EmailJobs['sendPasswordResetCode']) =>
	emailQueue.add('sendPasswordResetCode', payload)

export const enqueueEmailChangeCode = (payload: EmailJobs['sendEmailChangeCode']) =>
	emailQueue.add('sendEmailChangeCode', payload)

export const enqueuePasswordChangeCode = (payload: EmailJobs['sendPasswordChangeCode']) =>
	emailQueue.add('sendPasswordChangeCode', payload)
