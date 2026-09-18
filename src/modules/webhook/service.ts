import type { Prisma } from '@prisma/generated/client'

import { extendLogContext, logger } from '~/infra/logger'
import { verifyWebhookSignature } from '~/infra/payments/heleket'
import { getPayment } from '~/infra/payments/yookassa'
import { BadRequestError } from '~/shared/errors'

import { createWebhookEvent, findWebhookEvent } from './repository'

const PSP_HELEKET = 'heleket'
const PSP_YOOKASSA = 'yookassa'

export const receiveHeleketWebhook = async (payload: Record<string, unknown>) => {
	const { uuid, type } = payload

	if (typeof uuid !== 'string' || typeof type !== 'string') {
		throw new BadRequestError('Malformed webhook payload')
	}

	if (await findWebhookEvent(PSP_HELEKET, uuid)) {
		extendLogContext({ event: 'webhook_duplicate', provider: PSP_HELEKET, pspEventId: uuid })

		return
	}

	const signatureOk = verifyWebhookSignature(payload)

	await createWebhookEvent({
		pspName: PSP_HELEKET,
		pspEventId: uuid,
		eventType: type,
		signatureOk,
		payload: payload as Prisma.InputJsonValue
	})

	if (!signatureOk) {
		logger.warn(
			{ context: 'webhook', provider: PSP_HELEKET, pspEventId: uuid },
			'webhook_signature_invalid'
		)
	}

	extendLogContext({
		event: 'webhook_received',
		provider: PSP_HELEKET,
		eventType: type,
		signatureOk
	})
}

interface YookassaNotification {
	type?: string
	event?: string
	object?: { id?: string }
}

export const receiveYookassaWebhook = async (body: YookassaNotification) => {
	const { event, object } = body
	const objectId = object?.id

	if (!event || !objectId) {
		throw new BadRequestError('Malformed webhook payload')
	}

	const pspEventId = `${event}:${objectId}`

	if (await findWebhookEvent(PSP_YOOKASSA, pspEventId)) {
		extendLogContext({ event: 'webhook_duplicate', provider: PSP_YOOKASSA, pspEventId })

		return
	}

	/** YooKassa notifications carry no signature - their own docs recommend re-fetching the
	 *  object instead of trusting the body. `signatureOk` here means "confirmed via re-fetch". */
	let signatureOk = true
	let payload: unknown = object

	try {
		payload = await getPayment(objectId)
	} catch (err) {
		signatureOk = false

		logger.warn(
			{ context: 'webhook', provider: PSP_YOOKASSA, objectId, err },
			'webhook_refetch_failed'
		)
	}

	await createWebhookEvent({
		pspName: PSP_YOOKASSA,
		pspEventId,
		eventType: event,
		signatureOk,
		payload: payload as Prisma.InputJsonValue
	})

	extendLogContext({
		event: 'webhook_received',
		provider: PSP_YOOKASSA,
		eventType: event,
		signatureOk
	})
}
