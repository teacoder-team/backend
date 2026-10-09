import type { Html } from '@teacoder/telegram'

import { resend } from '~/lib/integrations/resend'
import { adminNotifier } from '~/lib/integrations/telegram'
import type { JobHandlers } from '~/lib/queue/runner'
import { normalizeEmail } from '~/lib/utils/email'
import { displayNameOf, htmlToText, stripQuotedReply } from '~/lib/utils/email-text'
import { getUserEmail } from '~/modules/auth/service'
import { hasActiveSubscription } from '~/modules/subscription/repository'

import type { NotificationJobs, SupportEmail } from './model'
import {
	findAccountsOnVisitor,
	findPurchasedCourse,
	findPurchaseDetails,
	findRegistrationDetails,
	findSupportSender
} from './repository'
import {
	coursePurchaseMessage,
	registrationMessage,
	subscriptionPurchaseMessage,
	subscriptionRenewalMessage,
	supportEmailMessage
} from './service'

interface WithAuthentication {
	authentication?: SupportEmail['authentication']
}

const fetchSupportEmail = async (emailId: string): Promise<SupportEmail | null> => {
	const { data, error } = await resend.emails.receiving.get(emailId, { html_format: 'cid' })

	if (error) {
		if (error.statusCode === 404) {
			return null
		}

		throw new Error(`Resend refused to return email ${emailId}: ${error.message}`)
	}

	const text = data.text?.trim() ? data.text : htmlToText(data.html ?? '')
	const attachments = data.attachments.filter((file) => file.content_disposition !== 'inline')

	return {
		from: data.from,
		fromName: displayNameOf(data.headers?.from),
		replyTo: data.reply_to?.[0] ?? null,
		subject: data.subject,
		body: stripQuotedReply(text),
		receivedAt: new Date(data.created_at),
		attachments,
		authentication: (data as WithAuthentication).authentication ?? null
	}
}

const deliver = async (message: Html) => {
	const report = await adminNotifier?.send(message)

	if (report?.delivered === 0) {
		throw new Error('Admin notification reached no chat')
	}
}

export const notificationJobs: JobHandlers<NotificationJobs> = {
	notifyCoursePurchase: async ({ paymentId }) => {
		const purchase = await findPurchaseDetails(paymentId)

		if (!purchase) {
			return
		}

		const [email, hasPremium, course] = await Promise.all([
			getUserEmail(purchase.user.id),
			hasActiveSubscription(purchase.user.id),
			purchase.courseId ? findPurchasedCourse(purchase.courseId) : null
		])

		await deliver(coursePurchaseMessage({ purchase, course, email, hasPremium }))
	},

	notifySubscriptionPurchase: async ({ paymentId, months, previousExpiresAt }) => {
		const purchase = await findPurchaseDetails(paymentId)

		if (!purchase) {
			return
		}

		const email = await getUserEmail(purchase.user.id)

		await deliver(
			subscriptionPurchaseMessage({
				purchase,
				email,
				months,
				previousExpiresAt: previousExpiresAt ? new Date(previousExpiresAt) : null
			})
		)
	},

	notifySubscriptionRenewal: async ({ paymentId, outcome }) => {
		const purchase = await findPurchaseDetails(paymentId)

		if (!purchase) {
			return
		}

		const email = await getUserEmail(purchase.user.id)

		await deliver(subscriptionRenewalMessage({ purchase, email, outcome }))
	},

	notifyRegistration: async ({ userId, via }) => {
		const [user, email] = await Promise.all([
			findRegistrationDetails(userId),
			getUserEmail(userId)
		])

		if (!user) {
			return
		}

		const visitorId = user.sessions[0]?.visitorId
		const sameDevice = visitorId ? await findAccountsOnVisitor(visitorId, userId) : []

		await deliver(registrationMessage({ user, email, via, sameDevice }))
	},
	notifySupportEmail: async ({ emailId }) => {
		const email = await fetchSupportEmail(emailId)

		if (!email) {
			return
		}

		const sender = await findSupportSender(normalizeEmail(email.from))

		await deliver(supportEmailMessage({ email, sender }))
	}
}
