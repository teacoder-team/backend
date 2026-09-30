import type { AuthProvider } from '@prisma/generated/client'

import { AUTH_PROVIDER_TITLES } from '~/lib/integrations/oauth'
import { logger } from '~/lib/logger'
import { sendMail } from '~/lib/mail/client'
import AccountLinked from '~/lib/mail/templates/AccountLinked'
import { emailQueue } from '~/lib/queue/queues'
import type { JobHandlers } from '~/lib/queue/runner'
import { decryptEmail } from '~/lib/security/email-crypto'
import { formatDateTime } from '~/lib/utils/date'

import { findLinkNotificationTarget } from './repository'

export type OAuthEmailJobs = {
	sendAccountLinked: { userId: string; provider: AuthProvider; automatic: boolean; at: string }
}

export const oauthEmailJobs: JobHandlers<OAuthEmailJobs> = {
	sendAccountLinked: async ({ userId, provider, automatic, at }) => {
		const user = await findLinkNotificationTarget(userId)

		if (!user?.emailCipher) {
			return
		}

		const title = AUTH_PROVIDER_TITLES[provider]

		await sendMail({
			to: decryptEmail(user.emailCipher),
			subject: `К аккаунту TeaCoder привязан вход через ${title}`,
			template: AccountLinked({
				username: user.displayName,
				provider: title,
				automatic,
				time: formatDateTime(new Date(at))
			})
		})
	}
}

export const enqueueAccountLinked = async (payload: OAuthEmailJobs['sendAccountLinked']) => {
	try {
		await emailQueue.add('sendAccountLinked', payload)
	} catch (err) {
		logger.error({ context: 'oauth', err, ...payload }, 'account_linked_email_enqueue_failed')
	}
}
