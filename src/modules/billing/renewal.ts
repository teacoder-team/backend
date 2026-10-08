import { HttpError } from '@teacoder/http'
import type { Payment as YookassaPayment } from '@teacoder/payments/yookassa'

import { IntentStatus, PaymentProvider, type Prisma } from '@prisma/generated/client'

import { yookassa } from '~/lib/integrations/payments'
import { logger } from '~/lib/logger'
import { billingQueue } from '~/lib/queue/queues'
import {
	enqueueSubscriptionExpiredEmail,
	enqueueSubscriptionExpiringEmail,
	enqueueSubscriptionPaymentFailedEmail
} from '~/modules/subscription/jobs'
import { PREMIUM_PLAN } from '~/modules/subscription/plan'
import {
	endSubscriptionPeriod,
	findDueRenewals,
	findLapsedSubscriptions,
	findSubscriptionById,
	findSubscriptionsEndingBetween
} from '~/modules/subscription/repository'

import { applyPaymentUpdate, endDeclinedRenewal } from './fulfillment'
import {
	attachProviderPayment,
	createPendingPayment,
	findChargeableMethod,
	findPaymentByIdempotencyKey,
	transitionPendingPayment
} from './repository'
import { RENEW_AHEAD_MS } from './schedule'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS
/** After this long past the end, an auto-renewal that kept failing for technical reasons stops. */
const GIVE_UP_AFTER_MS = 3 * DAY_MS
/** The reminder goes out three nights before the charge. */
const REMINDER_AHEAD_MS = 3 * DAY_MS

const RENEWAL_DESCRIPTION = 'Автопродление «TeaCoder Premium» на 1 месяц'
const CURRENCY = 'RUB'

const YOOKASSA_STATUSES: Record<YookassaPayment['status'], IntentStatus> = {
	pending: IntentStatus.PROCESSING,
	waiting_for_capture: IntentStatus.PROCESSING,
	succeeded: IntentStatus.CAPTURED,
	canceled: IntentStatus.CANCELLED
}

export interface RenewalJob {
	subscriptionId: string
	/** ISO end of the period being paid for - the job does nothing once the period has moved. */
	periodEnd: string
}

/** One charge per period: the job id carries the end date, the intent's idempotency key too. */
const enqueueRenewal = (job: RenewalJob) =>
	billingQueue.add('renewSubscription', job, {
		jobId: `renew-${job.subscriptionId}-${Date.parse(job.periodEnd)}`
	})

const renewalKey = ({ subscriptionId, periodEnd }: RenewalJob) =>
	`renewal:${subscriptionId}:${periodEnd}`

/** Closes a subscription nobody is going to pay for and tells the user why. */
const closeLapsed = async (subscription: {
	id: string
	userId: string
	isAutoBilling: boolean
	expiresAt: Date
}) => {
	if (!(await endSubscriptionPeriod(subscription.id, subscription.expiresAt))) {
		return false
	}

	const enqueue = subscription.isAutoBilling
		? enqueueSubscriptionPaymentFailedEmail
		: enqueueSubscriptionExpiredEmail

	await enqueue({ userId: subscription.userId }).catch((err: unknown) => {
		logger.warn(
			{ context: 'billing', subscriptionId: subscription.id, err },
			'subscription_lapse_email_enqueue_failed'
		)
	})

	return true
}

/**
 * The nightly pass. Idempotent - every step re-checks the database, so running it twice the same
 * night changes nothing: lapses are guarded updates, renewals and reminders dedupe by job id.
 */
export const planNightlyBilling = async () => {
	const now = Date.now()

	const lapsed = await findLapsedSubscriptions(new Date(now), new Date(now - GIVE_UP_AFTER_MS))
	let closed = 0

	for (const subscription of lapsed) {
		if (await closeLapsed(subscription)) {
			closed++
		}
	}

	const [due, ending] = await Promise.all([
		findDueRenewals(new Date(now - GIVE_UP_AFTER_MS), new Date(now + RENEW_AHEAD_MS)),
		findSubscriptionsEndingBetween(
			new Date(now + REMINDER_AHEAD_MS),
			new Date(now + REMINDER_AHEAD_MS + DAY_MS)
		)
	])

	for (const subscription of due) {
		await enqueueRenewal({
			subscriptionId: subscription.id,
			periodEnd: subscription.expiresAt.toISOString()
		})
	}

	for (const subscription of ending) {
		await enqueueSubscriptionExpiringEmail({
			userId: subscription.userId,
			expiresAt: subscription.expiresAt.toISOString()
		})
	}

	logger.info(
		{
			context: 'billing',
			closed,
			renewals: due.length,
			reminders: ending.length
		},
		'nightly_billing_planned'
	)
}

/** A charge that will never happen (no card, request refused): settle it as a declined renewal. */
const declineWithoutCharge = async (
	intent: Parameters<typeof endDeclinedRenewal>[0],
	failureCode: string
) => {
	await transitionPendingPayment(intent.id, IntentStatus.FAILED, failureCode)
	await endDeclinedRenewal(intent)

	logger.warn({ context: 'billing', paymentId: intent.id, failureCode }, 'renewal_not_charged')
}

const settleFromYookassa = (intentId: string, payment: YookassaPayment) =>
	applyPaymentUpdate({
		provider: PaymentProvider.YOOKASSA,
		paymentId: intentId,
		pspIntentId: payment.id,
		status: YOOKASSA_STATUSES[payment.status],
		amount: payment.amount.value,
		currency: payment.amount.currency,
		failureCode: payment.cancellation_details?.reason
	})

/**
 * Charges one period. Exactly one attempt per period: a decline ends the subscription (see
 * `endDeclinedRenewal`) and is never retried. Only an outage - YooKassa unreachable or 5xx -
 * fails the job, and the next night picks the same period up again.
 */
export const renewSubscription = async (job: RenewalJob) => {
	const subscription = await findSubscriptionById(job.subscriptionId)

	if (
		!subscription?.isActive ||
		!subscription.isAutoBilling ||
		subscription.expiresAt.toISOString() !== job.periodEnd
	) {
		logger.info({ context: 'billing', ...job }, 'renewal_skipped_period_changed')

		return
	}

	const { userId } = subscription
	const idempotencyKey = renewalKey(job)
	const existing = await findPaymentByIdempotencyKey(userId, idempotencyKey)

	if (existing && existing.status !== IntentStatus.REQUIRES_PAYMENT) {
		return
	}

	/** Created at YooKassa on an earlier night, outcome unknown here - ask instead of charging again. */
	if (existing?.pspIntentId) {
		await settleFromYookassa(existing.id, await yookassa.getPayment(existing.pspIntentId))

		return
	}

	const method = await findChargeableMethod(userId)

	const intent =
		existing ??
		(await createPendingPayment({
			userId,
			amount: PREMIUM_PLAN.amount,
			currency: CURRENCY,
			method: method?.type ?? 'BANK_CARD',
			provider: PaymentProvider.YOOKASSA,
			subscriptionId: subscription.id,
			paymentMethodId: method?.id,
			idempotencyKey,
			metadata: {
				renewal: true,
				months: PREMIUM_PLAN.months,
				periodEnd: job.periodEnd,
				description: RENEWAL_DESCRIPTION
			}
		}))

	if (!method) {
		return declineWithoutCharge(intent, 'no_saved_payment_method')
	}

	let payment: YookassaPayment

	try {
		payment = await yookassa.createRecurringPayment({
			amount: intent.amount,
			description: RENEWAL_DESCRIPTION,
			paymentMethodId: method.providerId,
			metadata: { paymentId: intent.id },
			idempotenceKey: intent.id
		})
	} catch (err) {
		/** 4xx: YooKassa refused this charge (method revoked or unusable) - a decline, not an outage. */
		if (err instanceof HttpError && err.status >= 400 && err.status < 500) {
			return declineWithoutCharge(intent, `yookassa_rejected_${err.status}`)
		}

		throw err
	}

	await attachProviderPayment(intent.id, payment.id, {
		raw: payment
	} as unknown as Prisma.InputJsonValue)
	await settleFromYookassa(intent.id, payment)
}
