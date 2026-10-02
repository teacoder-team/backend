const DAY_MS = 24 * 60 * 60 * 1000
/** Moscow has no DST: 03:00 MSK is always 00:00 UTC. */
const RUN_UTC_HOUR = 0

/** Quiet hours, and banks' daily limits have reset. */
export const NIGHTLY_BILLING_CRON = { pattern: '0 3 * * *', tz: 'Europe/Moscow' }

/** Charged a run ahead of the end, so premium never lapses while the night job waits. */
export const RENEW_AHEAD_MS = DAY_MS

/** The nightly run that will charge a period ending at `expiresAt` - the first one within a day of the end. */
export const plannedChargeAt = (expiresAt: Date) => {
	const earliest = expiresAt.getTime() - RENEW_AHEAD_MS
	const run = new Date(earliest)

	run.setUTCHours(RUN_UTC_HOUR, 0, 0, 0)

	if (run.getTime() < earliest) {
		run.setTime(run.getTime() + DAY_MS)
	}

	return run
}
