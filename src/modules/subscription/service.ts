import { PaymentMethod } from '@prisma/generated/client'

import { ConflictError } from '~/lib/errors'
import { extendLogContext, logger } from '~/lib/logger'
import { addMonths } from '~/lib/utils/date'
import type { UpdateSubscriptionInput } from '~/modules/billing/model'
import { findChargeableMethod } from '~/modules/billing/repository'

import type { SubscriptionState, SubscriptionTerm } from './model'
import {
	cancelSubscription as cancelSubscriptionRow,
	findSubscription,
	setAutoBilling
} from './repository'

const DAY_MS = 24 * 60 * 60 * 1000

const RUN_UTC_HOUR = 0

export const RENEW_AHEAD_MS = DAY_MS

export const plannedChargeAt = (expiresAt: Date) => {
	const earliest = expiresAt.getTime() - RENEW_AHEAD_MS
	const run = new Date(earliest)

	run.setUTCHours(RUN_UTC_HOUR, 0, 0, 0)

	if (run.getTime() < earliest) {
		run.setTime(run.getTime() + DAY_MS)
	}

	return run
}

export const PREMIUM_PLAN = {
	amount: 449,
	months: 1,
	description: 'Оплата «TeaCoder Premium» на 1 месяц',
	stars: 150
} as const

export const PREMIUM_INTERNATIONAL_AMOUNT = 499

export const premiumAmount = (method: PaymentMethod) =>
	method === PaymentMethod.INTERNATIONAL_CARD ? PREMIUM_INTERNATIONAL_AMOUNT : PREMIUM_PLAN.amount

export const isLiveSubscription = (subscription: SubscriptionState | null, now = new Date()) =>
	Boolean(subscription?.isActive) && Boolean(subscription && subscription.expiresAt > now)

export const nextTerm = (
	current: SubscriptionState | null,
	months: number,
	now = new Date()
): SubscriptionTerm => {
	if (current && isLiveSubscription(current, now)) {
		return {
			kind: 'extended',
			startedAt: current.startedAt,
			expiresAt: addMonths(current.expiresAt, months),
			previousExpiresAt: current.expiresAt
		}
	}

	return {
		kind: 'started',
		startedAt: now,
		expiresAt: addMonths(now, months),
		previousExpiresAt: null
	}
}

export const cancelSubscription = async (userId: string) => {
	const cancelled = await cancelSubscriptionRow(userId)

	if (cancelled) {
		logger.info({ userId }, 'subscription_cancelled')
	}

	return { cancelled: Boolean(cancelled) }
}

type SubscriptionRow = Awaited<ReturnType<typeof findSubscription>>

const isLive = (subscription: SubscriptionRow): subscription is NonNullable<SubscriptionRow> =>
	isLiveSubscription(subscription)

type ChargeableMethod = Awaited<ReturnType<typeof findChargeableMethod>>

const toSubscriptionResponse = (subscription: SubscriptionRow, method: ChargeableMethod) => ({
	isActive: isLive(subscription),
	autoRenew: isLive(subscription) && subscription.isAutoBilling,
	startedAt: subscription?.startedAt.toISOString() ?? null,
	expiresAt: subscription?.expiresAt.toISOString() ?? null,
	paymentMethod: method && { type: method.type, title: method.title, last4: method.last4 }
})

export const getSubscription = async (userId: string) => {
	const [subscription, method] = await Promise.all([
		findSubscription(userId),
		findChargeableMethod(userId)
	])

	return toSubscriptionResponse(subscription, method)
}

export const updateSubscription = async (
	userId: string,
	{ autoRenew }: UpdateSubscriptionInput
) => {
	const [subscription, method] = await Promise.all([
		findSubscription(userId),
		findChargeableMethod(userId)
	])

	if (!isLive(subscription)) {
		if (autoRenew) {
			throw new ConflictError('No active subscription to renew')
		}

		return toSubscriptionResponse(subscription, method)
	}

	if (autoRenew && !method) {
		throw new ConflictError(
			'No saved payment method - pay for premium through YooKassa to save one'
		)
	}

	if (subscription.isAutoBilling === autoRenew) {
		return toSubscriptionResponse(subscription, method)
	}

	const updated = await setAutoBilling(userId, autoRenew)

	extendLogContext({
		event: autoRenew ? 'subscription_auto_renew_enabled' : 'subscription_auto_renew_disabled',
		userId
	})

	return toSubscriptionResponse(updated, method)
}
