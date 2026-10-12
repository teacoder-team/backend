import { HttpError } from '@teacoder/http'
import type { Payment as YookassaPayment } from '@teacoder/payments/yookassa'

import {
	IntentStatus,
	type PaymentIntent,
	PaymentMethod,
	PaymentProvider,
	type Prisma
} from '@prisma/generated/client'

import { env } from '~/config/env'
import { robokassa, yookassa } from '~/lib/integrations/payments'
import { LockTakenError, withLock } from '~/lib/lock'
import { logger } from '~/lib/logger'
import { billingQueue, maintenanceQueue } from '~/lib/queue/queues'
import type { JobHandlers } from '~/lib/queue/runner'
import {
	enqueueSubscriptionExpiredEmail,
	enqueueSubscriptionExpiringEmail,
	enqueueSubscriptionPaymentFailedEmail
} from '~/modules/subscription/jobs'
import {
	endSubscriptionPeriod,
	findDueRenewals,
	findLapsedSubscriptions,
	findSubscriptionById,
	findSubscriptionsEndingBetween
} from '~/modules/subscription/repository'
import { PREMIUM_PLAN, RENEW_AHEAD_MS } from '~/modules/subscription/service'

import type { RenewalJob } from './model'
import {
	attachProviderPayment,
	createPendingPayment,
	findChargeableMethod,
	findPaymentByIdempotencyKey,
	transitionPendingPayment
} from './repository'
import { applyPaymentUpdate, endDeclinedRenewal } from './service'

export type BillingJobs = {
	renewSubscription: RenewalJob
}

export const billingJobs: JobHandlers<BillingJobs> = {
	renewSubscription: (job) => renewSubscription(job)
}

export type BillingMaintenanceJobs = {
	planNightlyBilling: Record<string, never>
}

export const billingMaintenanceJobs: JobHandlers<BillingMaintenanceJobs> = {
	planNightlyBilling: () => planNightlyBilling()
}

export const scheduleNightlyBilling = () =>
	maintenanceQueue.upsertJobScheduler('nightly-billing', NIGHTLY_BILLING_CRON, {
		name: 'planNightlyBilling'
	})

const NIGHTLY_BILLING_CRON = { pattern: '0 3 * * *', tz: 'Europe/Moscow' }

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

const GIVE_UP_AFTER_MS = 3 * DAY_MS

const REMINDER_AHEAD_MS = 3 * DAY_MS

const RENEWAL_DESCRIPTION = 'Автопродление «TeaCoder Premium» на 1 месяц'
const CURRENCY = 'RUB'

const YOOKASSA_STATUSES: Record<YookassaPayment['status'], IntentStatus> = {
	pending: IntentStatus.PROCESSING,
	waiting_for_capture: IntentStatus.PROCESSING,
	succeeded: IntentStatus.CAPTURED,
	canceled: IntentStatus.CANCELLED
}

const enqueueRenewal = (job: RenewalJob) =>
	billingQueue.add('renewSubscription', job, {
		jobId: `renew-${job.subscriptionId}-${Date.parse(job.periodEnd)}`
	})

const renewalKey = ({ subscriptionId, periodEnd }: RenewalJob) =>
	`renewal:${subscriptionId}:${periodEnd}`

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

const declineWithoutCharge = async (
	intent: Parameters<typeof endDeclinedRenewal>[0],
	failureCode: string
) => {
	if (!(await transitionPendingPayment(intent.id, IntentStatus.FAILED, failureCode))) {
		return
	}
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

type RenewableSubscription = NonNullable<Awaited<ReturnType<typeof findSubscriptionById>>>

export const renewSubscription = async (job: RenewalJob) => {
	const subscription = await findSubscriptionById(job.subscriptionId)
	const firstAttempt = subscription
		? await findPaymentByIdempotencyKey(subscription.userId, renewalKey(job))
		: null

	if (
		!subscription?.isActive ||
		!subscription.isAutoBilling ||
		subscription.expiresAt.toISOString() !== job.periodEnd
	) {
		if (subscription && firstAttempt?.provider === PaymentProvider.ROBOKASSA) {
			const latest = await findLatestAttempt(subscription.userId, job)

			if (latest?.intent.status === IntentStatus.PROCESSING) {
				return reconcileRobokassaAttempt(job, latest.attempt, latest.intent)
			}
		}

		logger.info({ context: 'billing', ...job }, 'renewal_skipped_period_changed')

		return
	}

	const provider =
		firstAttempt?.provider ?? (await findChargeableMethod(subscription.userId))?.provider

	if (provider === PaymentProvider.ROBOKASSA) {
		return renewWithRobokassa(job, subscription)
	}

	return renewWithYookassa(job, subscription, firstAttempt)
}

const renewWithYookassa = async (
	job: RenewalJob,
	subscription: RenewableSubscription,
	existing: PaymentIntent | null
) => {
	const { userId } = subscription
	const idempotencyKey = renewalKey(job)

	if (existing && existing.status !== IntentStatus.REQUIRES_PAYMENT) {
		return
	}

	if (existing?.pspIntentId) {
		await settleFromYookassa(existing.id, await yookassa.getPayment(existing.pspIntentId))

		return
	}

	const method = await findChargeableMethod(userId, PaymentProvider.YOOKASSA)

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

const ROBOKASSA_MAX_ATTEMPTS = 3
const ROBOKASSA_RETRY_DELAY_MS = 12 * HOUR_MS
const ROBOKASSA_CHECK_DELAY_MS = 15 * 60 * 1000
const ROBOKASSA_LOCK_TTL_MS = 60_000

const ROBOKASSA_STATE = {
	CANCELLED: 10,
	REFUNDED: 60,
	SUCCEEDED: 100
} as const

const attemptKey = (job: RenewalJob, attempt: number) =>
	attempt === 1 ? renewalKey(job) : `${renewalKey(job)}:${attempt}`

const scheduleRenewalCheck = (job: RenewalJob, delay: number) =>
	billingQueue.add('renewSubscription', job, {
		jobId: `renew-${job.subscriptionId}-${Date.parse(job.periodEnd)}-check-${Date.now()}`,
		delay
	})

const findLatestAttempt = async (userId: string, job: RenewalJob) => {
	let latest: { attempt: number; intent: PaymentIntent } | null = null

	for (let attempt = 1; attempt <= ROBOKASSA_MAX_ATTEMPTS; attempt++) {
		const intent = await findPaymentByIdempotencyKey(userId, attemptKey(job, attempt))

		if (!intent) {
			break
		}

		latest = { attempt, intent }
	}

	return latest
}

const renewWithRobokassa = async (job: RenewalJob, subscription: RenewableSubscription) => {
	try {
		await withLock(`renewal:${subscription.id}`, ROBOKASSA_LOCK_TTL_MS, () =>
			advanceRobokassaRenewal(job, subscription)
		)
	} catch (err) {
		if (err instanceof LockTakenError) {
			logger.info({ context: 'billing', ...job }, 'renewal_skipped_in_progress')

			return
		}

		throw err
	}
}

const advanceRobokassaRenewal = async (job: RenewalJob, subscription: RenewableSubscription) => {
	const latest = await findLatestAttempt(subscription.userId, job)

	if (!latest) {
		return startRobokassaAttempt(job, subscription, 1)
	}

	const { attempt, intent } = latest

	if (intent.status === IntentStatus.CAPTURED) {
		return
	}

	if (
		intent.status === IntentStatus.REQUIRES_PAYMENT ||
		intent.status === IntentStatus.PROCESSING
	) {
		return reconcileRobokassaAttempt(job, attempt, intent)
	}

	if (attempt >= ROBOKASSA_MAX_ATTEMPTS) {
		return endDeclinedRenewal(intent)
	}

	const retryAt = intent.updatedAt.getTime() + ROBOKASSA_RETRY_DELAY_MS

	if (retryAt > Date.now()) {
		await scheduleRenewalCheck(job, retryAt - Date.now())

		return
	}

	return startRobokassaAttempt(job, subscription, attempt + 1)
}

const failRobokassaAttempt = async (
	job: RenewalJob,
	attempt: number,
	intent: PaymentIntent,
	failureCode: string
) => {
	await transitionPendingPayment(intent.id, IntentStatus.FAILED, failureCode)

	logger.warn(
		{ context: 'billing', paymentId: intent.id, attempt, failureCode },
		'renewal_attempt_failed'
	)

	if (attempt >= ROBOKASSA_MAX_ATTEMPTS) {
		await endDeclinedRenewal(intent)

		return
	}

	await scheduleRenewalCheck(job, ROBOKASSA_RETRY_DELAY_MS)
}

const startRobokassaAttempt = async (
	job: RenewalJob,
	subscription: RenewableSubscription,
	attempt: number
) => {
	if (!env.ROBOKASSA_RECURRING_ENABLED || env.ROBOKASSA_TEST_MODE) {
		logger.info({ context: 'billing', ...job }, 'robokassa_recurring_disabled')

		return
	}

	const current = await findSubscriptionById(subscription.id)

	if (
		!current?.isActive ||
		!current.isAutoBilling ||
		current.expiresAt.toISOString() !== job.periodEnd
	) {
		return
	}

	const firstAttempt =
		attempt > 1 ? await findPaymentByIdempotencyKey(subscription.userId, renewalKey(job)) : null
	const method =
		attempt === 1 || firstAttempt?.paymentMethodId
			? await findChargeableMethod(
					subscription.userId,
					PaymentProvider.ROBOKASSA,
					firstAttempt?.paymentMethodId ?? undefined
				)
			: null

	const intent = await createPendingPayment({
		userId: subscription.userId,
		amount: PREMIUM_PLAN.amount,
		currency: CURRENCY,
		method: PaymentMethod.BANK_CARD,
		provider: PaymentProvider.ROBOKASSA,
		subscriptionId: subscription.id,
		paymentMethodId: method?.id,
		idempotencyKey: attemptKey(job, attempt),
		metadata: {
			renewal: true,
			attempt,
			months: PREMIUM_PLAN.months,
			periodEnd: job.periodEnd,
			description: RENEWAL_DESCRIPTION
		}
	})

	await attachProviderPayment(intent.id, String(intent.invoiceNumber), {})

	if (!method) {
		return failRobokassaAttempt(job, ROBOKASSA_MAX_ATTEMPTS, intent, 'no_saved_payment_method')
	}

	const metadata = method.metadata as { testMode?: boolean } | null
	const previousInvoiceId = Number(method.providerId)

	if (
		metadata?.testMode !== false ||
		!Number.isSafeInteger(previousInvoiceId) ||
		previousInvoiceId <= 0
	) {
		return failRobokassaAttempt(job, ROBOKASSA_MAX_ATTEMPTS, intent, 'invalid_recurring_parent')
	}

	return chargeRobokassaAttempt(job, attempt, intent, previousInvoiceId)
}

const chargeRobokassaAttempt = async (
	job: RenewalJob,
	attempt: number,
	intent: PaymentIntent,
	previousInvoiceId: number
) => {
	const subscription = await findSubscriptionById(job.subscriptionId)

	if (
		!subscription?.isActive ||
		!subscription.isAutoBilling ||
		subscription.expiresAt.toISOString() !== job.periodEnd
	) {
		return
	}

	if (!(await transitionPendingPayment(intent.id, IntentStatus.PROCESSING, null))) {
		return
	}

	try {
		await robokassa.chargeRecurring({
			invoiceId: intent.invoiceNumber,
			previousInvoiceId,
			amount: intent.amount,
			description: RENEWAL_DESCRIPTION,
			customParams: { paymentId: intent.id }
		})
	} catch (err) {
		logger.warn(
			{ context: 'billing', paymentId: intent.id, attempt, err },
			'robokassa_recurring_request_failed'
		)
	}

	await scheduleRenewalCheck(job, ROBOKASSA_CHECK_DELAY_MS)
}

const reconcileRobokassaAttempt = async (
	job: RenewalJob,
	attempt: number,
	intent: PaymentIntent
) => {
	if (env.ROBOKASSA_TEST_MODE) {
		logger.info({ context: 'billing', ...job }, 'robokassa_test_state_unavailable')

		return
	}

	let state: Awaited<ReturnType<typeof robokassa.getOperationState>>

	try {
		state = await robokassa.getOperationState(intent.invoiceNumber)
	} catch (err) {
		logger.warn(
			{ context: 'billing', paymentId: intent.id, attempt, err },
			'robokassa_operation_state_failed'
		)

		if (Date.now() - intent.createdAt.getTime() <= GIVE_UP_AFTER_MS) {
			await scheduleRenewalCheck(job, ROBOKASSA_CHECK_DELAY_MS)
		}

		return
	}

	if (state.found && state.stateCode === ROBOKASSA_STATE.SUCCEEDED) {
		if (!state.amount || !state.currency) {
			throw new Error('Robokassa operation state is missing amount or currency')
		}

		const result = await applyPaymentUpdate({
			provider: PaymentProvider.ROBOKASSA,
			paymentId: intent.id,
			pspIntentId: String(intent.invoiceNumber),
			status: IntentStatus.CAPTURED,
			amount: state.amount,
			currency: state.currency === 'RUR' ? 'RUB' : state.currency
		})

		if (result.outcome === 'rejected') {
			throw new Error(`Robokassa renewal rejected: ${result.reason}`)
		}

		return
	}

	if (
		state.found &&
		(state.stateCode === ROBOKASSA_STATE.CANCELLED ||
			state.stateCode === ROBOKASSA_STATE.REFUNDED)
	) {
		return failRobokassaAttempt(job, attempt, intent, `robokassa_state_${state.stateCode}`)
	}

	if (Date.now() - intent.createdAt.getTime() > GIVE_UP_AFTER_MS) {
		logger.error(
			{ context: 'billing', paymentId: intent.id, attempt, state },
			'robokassa_recurring_state_unresolved'
		)

		return
	}

	await scheduleRenewalCheck(job, ROBOKASSA_CHECK_DELAY_MS)
}
