import { createHash, randomBytes } from 'node:crypto'

import { redis } from '~/lib/redis'
import type { MfaMethod } from '~/modules/mfa/model'
import type { OAuthIdentity } from '~/modules/oauth/accounts'

export const MFA_TICKET_TTL = 5 * 60

export interface MfaChallenge {
	id: string
	method: MfaMethod
}

/** First factor passed, second pending. No session or tokens exist until it is confirmed. */
export interface MfaTicket {
	userId: string
	/** How the first factor was proven: `password`, `password_reset` or the OAuth provider. */
	via: string
	challenge: MfaChallenge | null
	/** Provider matched by email at sign-in - linked only once the second factor passes. */
	link: OAuthIdentity | null
}

const ticketKey = (token: string) =>
	`mfa:ticket:${createHash('sha256').update(token).digest('base64url')}`

export const openMfaTicket = async (
	userId: string,
	via: string,
	link: OAuthIdentity | null = null
) => {
	const token = randomBytes(32).toString('base64url')
	const ticket: MfaTicket = { userId, via, challenge: null, link }

	await redis.set(ticketKey(token), JSON.stringify(ticket), 'EX', MFA_TICKET_TTL)

	return token
}

export const readMfaTicket = async (token: string) => {
	const raw = await redis.get(ticketKey(token))

	return raw ? (JSON.parse(raw) as MfaTicket) : null
}

/** Keeps the ticket's original expiry; false if it expired in the meantime. */
export const setMfaChallenge = async (
	token: string,
	ticket: MfaTicket,
	challenge: MfaChallenge
) => {
	const saved = await redis.set(
		ticketKey(token),
		JSON.stringify({ ...ticket, challenge }),
		'KEEPTTL',
		'XX'
	)

	return saved === 'OK'
}

/** True only for the one caller that actually removed it - a ticket signs in once. */
export const closeMfaTicket = async (token: string) => (await redis.del(ticketKey(token))) === 1
