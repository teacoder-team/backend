import type { Prisma } from '@prisma/generated/client'

import { extendLogContext, logger } from '~/infra/logger'
import { verifyWebhookSignature } from '~/infra/payments/heleket'
import { getPayment } from '~/infra/payments/yookassa'
import { BadRequestError, ForbiddenError } from '~/shared/errors'
import { isIpAllowed } from '~/shared/ip-allowlist'

import { createWebhookEvent, findWebhookEvent } from './repository'

const PSP_HELEKET = 'heleket'
const PSP_YOOKASSA = 'yookassa'

/** Documented at https://doc.heleket.com/methods/payments/webhook. */
const HELEKET_IP_RANGES = ['31.133.220.8']

/** Documented at https://yookassa.ru/developers/using-api/webhooks. */
const YOOKASSA_IP_RANGES = [
	'185.71.76.0/27',
	'185.71.77.0/27',
	'77.75.153.0/25',
	'77.75.156.11',
	'77.75.156.35',
	'77.75.154.128/25',
	'2a02:5180::/32'
]

const assertKnownIp = (ip: string | null, ranges: readonly string[], provider: string) => {
	if (!ip || !isIpAllowed(ip, ranges)) {
		throw new ForbiddenError(`Request did not come from a recognized ${provider} IP`)
	}
}

export const receiveHeleketWebhook = async (
	payload: Record<string, unknown>,
	ip: string | null
) => {
	assertKnownIp(ip, HELEKET_IP_RANGES, 'Heleket')

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
			{
				context: 'webhook',
				provider: PSP_HELEKET,
				pspEventId: uuid
			},
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

export const receiveYookassaWebhook = async (body: YookassaNotification, ip: string | null) => {
	assertKnownIp(ip, YOOKASSA_IP_RANGES, 'YooKassa')

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
