import { maintenanceQueue } from '~/lib/queue/queues'
import type { JobHandlers } from '~/lib/queue/runner'

import { planNightlyBilling, type RenewalJob, renewSubscription } from './renewal'
import { NIGHTLY_BILLING_CRON } from './schedule'

export type BillingJobs = {
	renewSubscription: RenewalJob
}

export const billingJobs: JobHandlers<BillingJobs> = { renewSubscription }

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
