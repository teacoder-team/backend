import { env } from '~/config/env'
import { sendMail } from '~/lib/mail/client'
import SubscriptionExpired from '~/lib/mail/templates/SubscriptionExpired'
import SubscriptionExpiring from '~/lib/mail/templates/SubscriptionExpiring'
import SubscriptionPaymentFailed from '~/lib/mail/templates/SubscriptionPaymentFailed'
import SubscriptionPurchase from '~/lib/mail/templates/SubscriptionPurchase'
import SubscriptionRenewed from '~/lib/mail/templates/SubscriptionRenewed'
import { emailQueue } from '~/lib/queue/queues'
import type { JobHandlers } from '~/lib/queue/runner'
import { formatDate, formatTime } from '~/lib/utils/date'
import { getUserEmail } from '~/modules/auth/service'

import { findRenewalMailTarget, findRenewalReceipt, findSubscriptionMailTarget } from './repository'
import { plannedChargeAt, PREMIUM_PLAN } from './service'

const COURSES_URL = `${env.APP_URL}/courses`
const PREMIUM_URL = `${env.APP_URL}/premium`
const SETTINGS_URL = `${env.APP_URL}/account/settings`

export type SubscriptionEmailJobs = {
	sendSubscriptionPurchase: { userId: string; extended: boolean }
	sendSubscriptionRenewed: { paymentId: string }
	sendSubscriptionPaymentFailed: { userId: string }
	sendSubscriptionExpired: { userId: string }
	sendSubscriptionExpiring: { userId: string; expiresAt: string }
}

export const subscriptionEmailJobs: JobHandlers<SubscriptionEmailJobs> = {
	sendSubscriptionPurchase: async ({ userId, extended }) => {
		const [email, user] = await Promise.all([
			getUserEmail(userId),
			findSubscriptionMailTarget(userId)
		])
		const expiresAt = user?.subscription?.expiresAt

		if (!email || !user || !expiresAt) {
			return
		}

		await sendMail({
			to: email,
			subject: extended ? 'Премиум продлён - TeaCoder' : 'Премиум активирован - TeaCoder',
			template: SubscriptionPurchase({
				username: user.displayName,
				expiresAt: formatDate(expiresAt),
				extended,
				coursesUrl: COURSES_URL
			}),
			sender: 'noreply'
		})
	},

	sendSubscriptionRenewed: async ({ paymentId }) => {
		const receipt = await findRenewalReceipt(paymentId)
		const expiresAt = receipt?.user.subscription?.expiresAt
		const email = receipt && (await getUserEmail(receipt.user.id))

		if (!receipt || !email || !expiresAt) {
			return
		}

		await sendMail({
			to: email,
			subject: 'Подписка продлена - TeaCoder',
			template: SubscriptionRenewed({
				username: receipt.user.displayName,
				amount: receipt.amount,
				currency: receipt.currency,
				expiresAt: formatDate(expiresAt),
				manageUrl: SETTINGS_URL
			}),
			sender: 'noreply'
		})
	},

	sendSubscriptionPaymentFailed: async ({ userId }) => {
		const [email, user] = await Promise.all([
			getUserEmail(userId),
			findRenewalMailTarget(userId)
		])

		if (!email || !user) {
			return
		}

		await sendMail({
			to: email,
			subject: 'Не получилось продлить подписку - TeaCoder',
			template: SubscriptionPaymentFailed({
				username: user.displayName,
				premiumUrl: PREMIUM_URL
			}),
			sender: 'noreply'
		})
	},

	sendSubscriptionExpired: async ({ userId }) => {
		const [email, user] = await Promise.all([
			getUserEmail(userId),
			findRenewalMailTarget(userId)
		])

		if (!email || !user) {
			return
		}

		await sendMail({
			to: email,
			subject: 'Премиум-подписка закончилась - TeaCoder',
			template: SubscriptionExpired({ username: user.displayName, premiumUrl: PREMIUM_URL }),
			sender: 'noreply'
		})
	},

	sendSubscriptionExpiring: async ({ userId, expiresAt }) => {
		const [email, user] = await Promise.all([
			getUserEmail(userId),
			findRenewalMailTarget(userId)
		])
		const subscription = user?.subscription

		if (
			!email ||
			!user ||
			!subscription?.isActive ||
			subscription.expiresAt.toISOString() !== expiresAt
		) {
			return
		}

		const at = subscription.isAutoBilling
			? plannedChargeAt(subscription.expiresAt)
			: subscription.expiresAt

		await sendMail({
			to: email,
			subject: subscription.isAutoBilling
				? 'Скоро продление подписки - TeaCoder'
				: 'Подписка скоро закончится - TeaCoder',
			template: SubscriptionExpiring({
				username: user.displayName,
				isAutoBilling: subscription.isAutoBilling,
				date: formatDate(at),
				time: formatTime(at),
				amount: PREMIUM_PLAN.amount,
				currency: 'RUB',
				manageUrl: SETTINGS_URL,
				premiumUrl: PREMIUM_URL
			}),
			sender: 'noreply'
		})
	}
}

export const enqueueSubscriptionPurchaseEmail = (
	payload: SubscriptionEmailJobs['sendSubscriptionPurchase']
) => emailQueue.add('sendSubscriptionPurchase', payload)

export const enqueueSubscriptionRenewedEmail = (
	payload: SubscriptionEmailJobs['sendSubscriptionRenewed']
) => emailQueue.add('sendSubscriptionRenewed', payload)

export const enqueueSubscriptionPaymentFailedEmail = (
	payload: SubscriptionEmailJobs['sendSubscriptionPaymentFailed']
) => emailQueue.add('sendSubscriptionPaymentFailed', payload)

export const enqueueSubscriptionExpiredEmail = (
	payload: SubscriptionEmailJobs['sendSubscriptionExpired']
) => emailQueue.add('sendSubscriptionExpired', payload)

export const enqueueSubscriptionExpiringEmail = (
	payload: SubscriptionEmailJobs['sendSubscriptionExpiring']
) =>
	emailQueue.add('sendSubscriptionExpiring', payload, {
		jobId: `expiring-${payload.userId}-${Date.parse(payload.expiresAt)}`
	})
