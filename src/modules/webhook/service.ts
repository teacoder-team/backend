import { HttpError } from '@teacoder/http'
import type {
	WebhookPayload as HeleketPayload,
	PaymentStatus as HeleketStatus
} from '@teacoder/payments/heleket'
import type { Payment as YookassaPayment } from '@teacoder/payments/yookassa'

import { IntentStatus, PaymentProvider, type Prisma } from '@prisma/generated/client'

import { env } from '~/config/env'
import {
	AppError,
	BadRequestError,
	ForbiddenError,
	NotFoundError,
	UnauthorizedError
} from '~/lib/errors'
import { heleket, yookassa } from '~/lib/integrations/payments'
import { resend } from '~/lib/integrations/resend'
import { extendLogContext, logger } from '~/lib/logger'
import { normalizeEmail } from '~/lib/utils/email'
import { createIpAllowlist } from '~/lib/utils/ip'
import { enqueueSupportEmailNotification } from '~/modules/admin-bot/queue'
import { applyPaymentUpdate, type ProviderPaymentUpdate } from '~/modules/billing/fulfillment'
import { toSavedMethod } from '~/modules/billing/yookassa-method'

import {
	createWebhookEvent,
	findWebhookEvent,
	markWebhookFailed,
	markWebhookProcessed,
	refreshWebhookEvent
} from './repository'

const PSP_HELEKET = 'heleket'
const PSP_YOOKASSA = 'yookassa'

/** Documented at https://doc.heleket.com/methods/payments/webhook. */
const isHeleketIp = createIpAllowlist(['31.133.220.8'])

/** Documented at https://yookassa.ru/developers/using-api/webhooks. */
const isYookassaIp = createIpAllowlist([
	'185.71.76.0/27',
	'185.71.77.0/27',
	'77.75.153.0/25',
	'77.75.156.11',
	'77.75.156.35',
	'77.75.154.128/25',
	'2a02:5180::/32'
])

/** Refund statuses are left out on purpose - refunds are not handled yet. */
const HELEKET_STATUSES: Partial<Record<HeleketStatus, IntentStatus>> = {
	confirm_check: IntentStatus.PROCESSING,
	paid: IntentStatus.CAPTURED,
	paid_over: IntentStatus.CAPTURED,
	wrong_amount: IntentStatus.FAILED,
	fail: IntentStatus.FAILED,
	system_fail: IntentStatus.FAILED,
	cancel: IntentStatus.CANCELLED
}

const YOOKASSA_STATUSES: Record<YookassaPayment['status'], IntentStatus> = {
	pending: IntentStatus.REQUIRES_PAYMENT,
	waiting_for_capture: IntentStatus.PROCESSING,
	succeeded: IntentStatus.CAPTURED,
	canceled: IntentStatus.CANCELLED
}

const assertKnownIp = (
	ip: string | null,
	isAllowed: (ip: string | null) => boolean,
	provider: string
) => {
	if (!isAllowed(ip)) {
		throw new ForbiddenError(`Request did not come from a recognized ${provider} IP`)
	}
}

/**
 * Applies an authenticated update and records the outcome on the event. A thrown
 * error leaves the event unprocessed and surfaces as a 5xx, so the provider retries.
 */
const settle = async (eventId: string, update: ProviderPaymentUpdate) => {
	try {
		const result = await applyPaymentUpdate(update)

		await markWebhookProcessed(eventId, result.outcome === 'rejected' ? result.reason : null)
	} catch (err) {
		await markWebhookFailed(eventId, err instanceof Error ? err.message : String(err))

		throw err
	}
}

const isHeleketPayload = (
	payload: Record<string, unknown>
): payload is HeleketPayload & Record<string, unknown> =>
	['uuid', 'type', 'status', 'order_id', 'amount', 'currency'].every(
		(field) => typeof payload[field] === 'string'
	)

export const receiveHeleketWebhook = async (
	payload: Record<string, unknown>,
	ip: string | null
) => {
	assertKnownIp(ip, isHeleketIp, 'Heleket')

	if (!isHeleketPayload(payload)) {
		throw new BadRequestError('Malformed webhook payload')
	}

	/** Heleket posts once per status change of the same invoice - uuid alone would drop the "paid" one. */
	const pspEventId = `${payload.uuid}:${payload.status}`
	const existing = await findWebhookEvent(PSP_HELEKET, pspEventId)

	if (existing?.processedAt) {
		extendLogContext({ event: 'webhook_duplicate', provider: PSP_HELEKET, pspEventId })

		return
	}

	const signatureOk = heleket.verifyWebhookSignature(payload)

	const event =
		existing ??
		(await createWebhookEvent({
			pspName: PSP_HELEKET,
			pspEventId,
			eventType: payload.status,
			signatureOk,
			payload: payload as Prisma.InputJsonValue
		}))

	extendLogContext({
		event: 'webhook_received',
		provider: PSP_HELEKET,
		eventType: payload.status,
		signatureOk
	})

	if (!signatureOk) {
		logger.warn(
			{ context: 'webhook', provider: PSP_HELEKET, pspEventId },
			'webhook_signature_invalid'
		)

		return markWebhookProcessed(event.id, 'invalid_signature')
	}

	if (payload.type !== 'payment') {
		return markWebhookProcessed(event.id, 'not_an_invoice')
	}

	const status = HELEKET_STATUSES[payload.status]

	if (!status) {
		return markWebhookProcessed(event.id, `status_not_handled:${payload.status}`)
	}

	await settle(event.id, {
		provider: PaymentProvider.HELEKET,
		paymentId: payload.order_id,
		pspIntentId: payload.uuid,
		status,
		amount: payload.amount,
		currency: payload.currency,
		failureCode: status === IntentStatus.FAILED ? payload.status : undefined
	})
}

interface YookassaNotification {
	type?: string
	event?: string
	object?: { id?: string }
}

export const receiveYookassaWebhook = async (body: YookassaNotification, ip: string | null) => {
	assertKnownIp(ip, isYookassaIp, 'YooKassa')

	const { event, object } = body
	const objectId = object?.id

	if (!event || !objectId) {
		throw new BadRequestError('Malformed webhook payload')
	}

	const pspEventId = `${event}:${objectId}`
	const existing = await findWebhookEvent(PSP_YOOKASSA, pspEventId)

	if (existing?.processedAt) {
		extendLogContext({ event: 'webhook_duplicate', provider: PSP_YOOKASSA, pspEventId })

		return
	}

	const record = (signatureOk: boolean, payload: unknown) =>
		existing
			? refreshWebhookEvent(existing.id, {
					signatureOk,
					payload: payload as Prisma.InputJsonValue
				})
			: createWebhookEvent({
					pspName: PSP_YOOKASSA,
					pspEventId,
					eventType: event,
					signatureOk,
					payload: payload as Prisma.InputJsonValue
				})

	extendLogContext({ event: 'webhook_received', provider: PSP_YOOKASSA, eventType: event })

	/** Refunds, payouts and deals are not payments we can re-fetch - not handled yet. */
	if (!event.startsWith('payment.')) {
		const row = await record(false, object)

		return markWebhookProcessed(row.id, 'event_not_handled')
	}

	/** YooKassa notifications carry no signature - the API's own answer is the only trusted source. */
	let payment: YookassaPayment

	try {
		payment = await yookassa.getPayment(objectId)
	} catch (err) {
		const row = await record(false, object)

		if (err instanceof HttpError && err.status === 404) {
			logger.warn(
				{ context: 'webhook', provider: PSP_YOOKASSA, objectId },
				'webhook_unknown_payment'
			)

			return markWebhookProcessed(row.id, 'payment_not_found')
		}

		logger.warn(
			{ context: 'webhook', provider: PSP_YOOKASSA, objectId, err },
			'webhook_refetch_failed'
		)

		await markWebhookFailed(row.id, 'refetch_failed')

		throw new AppError('Could not confirm the payment with YooKassa, retry later', 503)
	}

	const row = await record(true, payment)
	const paymentId = payment.metadata?.paymentId

	if (typeof paymentId !== 'string') {
		return markWebhookProcessed(row.id, 'missing_payment_reference')
	}

	const status =
		payment.cancellation_details?.reason === 'expired_on_confirmation'
			? IntentStatus.EXPIRED
			: YOOKASSA_STATUSES[payment.status]

	await settle(row.id, {
		provider: PaymentProvider.YOOKASSA,
		paymentId,
		pspIntentId: payment.id,
		status,
		amount: payment.amount.value,
		currency: payment.amount.currency,
		failureCode: payment.cancellation_details?.reason,
		savedMethod: toSavedMethod(payment.payment_method)
	})
}

const PSP_RESEND = 'resend'

const SUPPORT_ADDRESS = normalizeEmail(env.SUPPORT_EMAIL)

const isForSupport = (data: { to: string[]; cc?: string[]; received_for?: string[] }) =>
	[...data.to, ...(data.cc ?? []), ...(data.received_for ?? [])].some(
		(address) => normalizeEmail(address) === SUPPORT_ADDRESS
	)

const verifyResendEvent = (payload: string, headers: Headers) => {
	const id = headers.get('svix-id')
	const timestamp = headers.get('svix-timestamp')
	const signature = headers.get('svix-signature')

	if (!env.RESEND_WEBHOOK_SECRET) {
		throw new NotFoundError('Resend webhook is not configured')
	}

	if (!id || !timestamp || !signature) {
		throw new UnauthorizedError('Missing Resend webhook signature')
	}

	try {
		const event = resend.webhooks.verify({
			payload,
			headers: { id, timestamp, signature },
			webhookSecret: env.RESEND_WEBHOOK_SECRET
		})

		return { id, event }
	} catch {
		throw new UnauthorizedError('Invalid Resend webhook signature')
	}
}

export const receiveResendWebhook = async (payload: string, headers: Headers) => {
	const { id: pspEventId, event } = verifyResendEvent(payload, headers)
	const existing = await findWebhookEvent(PSP_RESEND, pspEventId)

	if (existing?.processedAt) {
		extendLogContext({ event: 'webhook_duplicate', provider: PSP_RESEND, pspEventId })

		return
	}

	const row =
		existing ??
		(await createWebhookEvent({
			pspName: PSP_RESEND,
			pspEventId,
			eventType: event.type,
			signatureOk: true,
			payload: event.data as unknown as Prisma.InputJsonValue
		}))

	extendLogContext({ event: 'webhook_received', provider: PSP_RESEND, eventType: event.type })

	if (event.type !== 'email.received') {
		return markWebhookProcessed(row.id, 'event_not_handled')
	}

	if (!isForSupport(event.data)) {
		return markWebhookProcessed(row.id, 'not_for_support')
	}

	await enqueueSupportEmailNotification({ emailId: event.data.email_id })
	await markWebhookProcessed(row.id, null)

	extendLogContext({ event: 'support_email_received', emailId: event.data.email_id })
}
