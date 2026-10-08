import { addMonths } from '~/lib/utils/date'

export interface SubscriptionState {
	isActive: boolean
	startedAt: Date
	expiresAt: Date
}

export const isLiveSubscription = (subscription: SubscriptionState | null, now = new Date()) =>
	Boolean(subscription?.isActive) && Boolean(subscription && subscription.expiresAt > now)

export interface SubscriptionTerm {
	kind: 'started' | 'extended'
	startedAt: Date
	expiresAt: Date
	/** The end date before this payment; null when it starts afresh. */
	previousExpiresAt: Date | null
}

/**
 * What a paid period does to the subscription. A live one is extended from its current end, so
 * paying early never loses the days left; a lapsed or missing one starts from now.
 */
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

	return { kind: 'started', startedAt: now, expiresAt: addMonths(now, months), previousExpiresAt: null }
}
