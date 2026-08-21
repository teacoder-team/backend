import { sendMail } from '@/infra/mail/client'
import VerificationCode from '@/infra/mail/templates/VerificationCode'
import { emailQueue } from '@/infra/queue/queues'
import type { JobHandlers } from '@/infra/queue/runner'

export type EmailJobs = {
	sendVerificationCode: { email: string; code: string }
}

export const emailJobs: JobHandlers<EmailJobs> = {
	sendVerificationCode: async ({ email, code }) => {
		await sendMail({
			to: email,
			subject: `${code} - код подтверждения TeaCoder`,
			template: VerificationCode({ code }),
			sender: 'hello',
		})
	},
}

export const enqueueVerificationCode = (
	payload: EmailJobs['sendVerificationCode'],
) => emailQueue.add('sendVerificationCode', payload)
