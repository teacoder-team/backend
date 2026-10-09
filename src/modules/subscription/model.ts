export interface SubscriptionState {
	isActive: boolean
	startedAt: Date
	expiresAt: Date
}

export interface SubscriptionTerm {
	kind: 'started' | 'extended'
	startedAt: Date
	expiresAt: Date

	previousExpiresAt: Date | null
}
