import { IntentStatus, type PaymentProvider } from '@prisma/generated/client'

import { extendLogContext, logger } from '~/lib/logger'
import { enqueueCoursePurchaseNotification } from '~/modules/admin-bot/jobs'
import { enqueueCoursePurchaseEmail } from '~/modules/course/jobs'

import {
	captureCoursePayment,
	findPaymentForFulfillment,
	type FulfillableIntent,
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
}

export type FulfillmentResult =
	| { outcome: 'course_granted'; courseId: string }
	| { outcome: 'already_owned'; courseId: string }
	| { outcome: 'already_captured' }
	| { outcome: 'status_updated'; status: IntentStatus }
	| { outcome: 'unchanged' }
	/** Left for a future handler - e.g. subscription payments, which are not processed yet. */
	| { outcome: 'deferred'; reason: string }
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

/** The payment is already settled - a failure here must not undo or fail it. */
const notifyAdmins = async (paymentId: string) => {
	await enqueueCoursePurchaseNotification({ paymentId }).catch((err: unknown) => {
		logger.warn({ context: 'billing', paymentId, err }, 'admin_notification_enqueue_failed')
	})
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

	await notifyAdmins(intent.id)

	return { outcome: 'course_granted', courseId: intent.courseId }
}

const applyToCoursePayment = async (
	intent: FulfillableIntent & { courseId: string },
	update: ProviderPaymentUpdate
): Promise<FulfillmentResult> => {
	if (update.status === IntentStatus.CAPTURED) {
		return capture(intent)
	}

	if (update.status === IntentStatus.REQUIRES_PAYMENT) {
		return { outcome: 'unchanged' }
	}

	const changed = await transitionPendingPayment(
		intent.id,
		update.status,
		update.failureCode ?? null
	)

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

	if (!intent.courseId) {
		return { outcome: 'deferred', reason: 'subscription_not_handled' }
	}

	const result = await applyToCoursePayment({ ...intent, courseId: intent.courseId }, update)

	extendLogContext({
		event: 'payment_update_applied',
		paymentId: intent.id,
		userId: intent.userId,
		status: update.status,
		outcome: result.outcome
	})

	return result
}
