import { IntentStatus, type PaymentProvider } from '@prisma/generated/client'

import { extendLogContext, logger } from '~/lib/logger'
import {
	enqueueCoursePurchaseNotification,
	enqueueSubscriptionPurchaseNotification,
	enqueueSubscriptionRenewalNotification
} from '~/modules/admin-bot/queue'
import { enqueueCoursePurchaseEmail } from '~/modules/course/jobs'
import {
	enqueueSubscriptionPaymentFailedEmail,
	enqueueSubscriptionPurchaseEmail,
	enqueueSubscriptionRenewedEmail
} from '~/modules/subscription/jobs'
import { PREMIUM_PLAN } from '~/modules/subscription/plan'
import { endSubscriptionPeriod } from '~/modules/subscription/repository'
import { nextTerm } from '~/modules/subscription/term'

import {
	captureCoursePayment,
	captureSubscriptionPayment,
	findPaymentForFulfillment,
	type FulfillableIntent,
	linkPaymentMethod,
	type SavedPaymentMethod,
	saveUserPaymentMethod,
	transitionPendingPayment
} from './repository'

/** What a provider says happened, already authenticated (signature or API re-fetch). */
export interface ProviderPaymentUpdate {
	provider: PaymentProvider
	/** Our PaymentIntent id, echoed back by the provider (order_id / metadata). */
	paymentId: string
	pspIntentId: string
	status: IntentStatus
	/** As the provider reports it, e.g. "449.00". */
	amount: string
	currency: string
	failureCode?: string
	/** The method the provider kept for later charges, if it did (YooKassa `save_payment_method`). */
	savedMethod?: SavedPaymentMethod
}

export type FulfillmentResult =
	| { outcome: 'course_granted'; courseId: string }
	| { outcome: 'subscription_granted'; expiresAt: string; extended: boolean }
	| { outcome: 'already_owned'; courseId: string }
	| { outcome: 'already_captured' }
	| { outcome: 'status_updated'; status: IntentStatus }
	| { outcome: 'unchanged' }
	/** Will never apply, no point retrying. */
	| { outcome: 'rejected'; reason: string }

const toMinorUnits = (value: string | number) => Math.round(Number(value) * 100)

const rejectionReason = (intent: FulfillableIntent | null, update: ProviderPaymentUpdate) => {
	if (!intent) {
		return 'unknown_payment'
	}

	if (intent.provider !== update.provider) {
		return 'provider_mismatch'
	}

	if (intent.pspIntentId && intent.pspIntentId !== update.pspIntentId) {
		return 'psp_intent_mismatch'
	}

	if (
		toMinorUnits(update.amount) !== toMinorUnits(intent.amount) ||
		update.currency !== intent.currency
	) {
		return 'amount_mismatch'
	}

	return null
}

const capture = async (
	intent: FulfillableIntent & { courseId: string }
): Promise<FulfillmentResult> => {
	const result = await captureCoursePayment({
		id: intent.id,
		userId: intent.userId,
		courseId: intent.courseId,
		amount: intent.amount,
		currency: intent.currency
	})

	if (result === 'already_captured') {
		return { outcome: 'already_captured' }
	}

	if (result === 'already_owned') {
		/**
		 * createPayment refuses owned courses, so this only happens when two invoices were
		 * opened before either was paid. Money was taken twice - needs a manual refund.
		 */
		logger.warn(
			{
				context: 'billing',
				paymentId: intent.id,
				userId: intent.userId,
				courseId: intent.courseId
			},
			'course_payment_captured_but_already_owned'
		)

		return { outcome: 'already_owned', courseId: intent.courseId }
	}

	await enqueueCoursePurchaseEmail({ userId: intent.userId, courseId: intent.courseId }).catch(
		(err: unknown) => {
			logger.warn(
				{ context: 'billing', paymentId: intent.id, err },
				'course_purchase_email_enqueue_failed'
			)
		}
	)

	await enqueueCoursePurchaseNotification({ paymentId: intent.id })

	return { outcome: 'course_granted', courseId: intent.courseId }
}

/** What the invoice was opened for, as written by checkout or the renewal job. */
interface SubscriptionInvoice {
	/** Older invoices without it were the one-month plan. */
	months: number
	/** Charged by the nightly job, not paid by the user. */
	renewal: boolean
	/** End of the period a renewal pays for (ISO). */
	periodEnd: string | null
}

const readInvoice = (metadata: unknown): SubscriptionInvoice => {
	const raw = (metadata ?? {}) as Record<string, unknown>
	const months = raw.months

	return {
		months:
			typeof months === 'number' && Number.isInteger(months) && months > 0
				? months
				: PREMIUM_PLAN.months,
		renewal: raw.renewal === true,
		periodEnd: typeof raw.periodEnd === 'string' ? raw.periodEnd : null
	}
}

const warnOnFailure = (paymentId: string, message: string) => (err: unknown) => {
	logger.warn({ context: 'billing', paymentId, err }, message)
}

/** Kept for the nightly renewal, which the user can enable after the payment is captured. */
const keepPaymentMethod = async (
	intent: FulfillableIntent,
	invoice: SubscriptionInvoice,
	saved: SavedPaymentMethod | undefined
) => {
	if (invoice.renewal) {
		return
	}

	if (!saved) {
		logger.warn(
			{ context: 'billing', paymentId: intent.id, userId: intent.userId },
			'payment_method_not_saved'
		)

		return
	}

	const method = await saveUserPaymentMethod(intent.userId, saved)

	await linkPaymentMethod(intent.id, method.id)
}

const captureSubscription = async (
	intent: FulfillableIntent,
	update: ProviderPaymentUpdate
): Promise<FulfillmentResult> => {
	const invoice = readInvoice(intent.metadata)
	const captured = await captureSubscriptionPayment(intent.id, intent.userId, (current) =>
		nextTerm(current, invoice.months)
	)

	if (captured.result === 'already_captured') {
		return { outcome: 'already_captured' }
	}

	const { term } = captured
	const extended = term.kind === 'extended'

	await keepPaymentMethod(intent, invoice, update.savedMethod).catch(
		warnOnFailure(intent.id, 'payment_method_save_failed')
	)

	if (invoice.renewal) {
		await enqueueSubscriptionRenewedEmail({ paymentId: intent.id }).catch(
			warnOnFailure(intent.id, 'subscription_renewed_email_enqueue_failed')
		)
		await enqueueSubscriptionRenewalNotification({ paymentId: intent.id, outcome: 'charged' })
	} else {
		await enqueueSubscriptionPurchaseEmail({ userId: intent.userId, extended }).catch(
			warnOnFailure(intent.id, 'subscription_purchase_email_enqueue_failed')
		)
		await enqueueSubscriptionPurchaseNotification({
			paymentId: intent.id,
			months: invoice.months,
			previousExpiresAt: term.previousExpiresAt?.toISOString() ?? null
		})
	}

	return { outcome: 'subscription_granted', expiresAt: term.expiresAt.toISOString(), extended }
}

const SETTLED_UNPAID = new Set<IntentStatus>([
	IntentStatus.FAILED,
	IntentStatus.CANCELLED,
	IntentStatus.EXPIRED
])

type RenewalIntent = Pick<FulfillableIntent, 'id' | 'userId' | 'subscriptionId' | 'metadata'>

/**
 * A declined renewal ends the subscription for good: no retries on the following nights,
 * auto-renewal goes off, the user is told. Only the period this charge was for is closed - if a
 * manual payment extended it in the meantime, that one wins.
 */
export const endDeclinedRenewal = async (intent: RenewalIntent) => {
	const { periodEnd } = readInvoice(intent.metadata)

	if (!intent.subscriptionId || !periodEnd) {
		return
	}

	if (!(await endSubscriptionPeriod(intent.subscriptionId, new Date(periodEnd)))) {
		return
	}

	logger.info(
		{ context: 'billing', paymentId: intent.id, userId: intent.userId },
		'subscription_renewal_declined'
	)

	await enqueueSubscriptionPaymentFailedEmail({ userId: intent.userId }).catch(
		warnOnFailure(intent.id, 'subscription_payment_failed_email_enqueue_failed')
	)
	await enqueueSubscriptionRenewalNotification({ paymentId: intent.id, outcome: 'declined' })
}

const applyToPayment = async (
	intent: FulfillableIntent,
	update: ProviderPaymentUpdate
): Promise<FulfillmentResult> => {
	if (update.status === IntentStatus.CAPTURED) {
		return intent.courseId
			? capture({ ...intent, courseId: intent.courseId })
			: captureSubscription(intent, update)
	}

	if (update.status === IntentStatus.REQUIRES_PAYMENT) {
		return { outcome: 'unchanged' }
	}

	const changed = await transitionPendingPayment(
		intent.id,
		update.status,
		update.failureCode ?? null
	)

	if (changed && SETTLED_UNPAID.has(update.status) && readInvoice(intent.metadata).renewal) {
		await endDeclinedRenewal(intent)
	}

	return changed ? { outcome: 'status_updated', status: update.status } : { outcome: 'unchanged' }
}

export const applyPaymentUpdate = async (
	update: ProviderPaymentUpdate
): Promise<FulfillmentResult> => {
	const intent = await findPaymentForFulfillment(update.paymentId)
	const reason = rejectionReason(intent, update)

	if (reason || !intent) {
		logger.error(
			{ context: 'billing', paymentId: update.paymentId, provider: update.provider, reason },
			'payment_update_rejected'
		)

		return { outcome: 'rejected', reason: reason ?? 'unknown_payment' }
	}

	const result = await applyToPayment(intent, update)

	extendLogContext({
		event: 'payment_update_applied',
		paymentId: intent.id,
		userId: intent.userId,
		status: update.status,
		outcome: result.outcome
	})

	return result
}
