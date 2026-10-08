import type { Prisma } from '@prisma/generated/client'

import { db } from '~/lib/db'

export const findWebhookEvent = (pspName: string, pspEventId: string) =>
	db.webhookEvent.findUnique({ where: { pspName_pspEventId: { pspName, pspEventId } } })

export interface NewWebhookEvent {
	pspName: string
	pspEventId: string
	eventType: string
	signatureOk: boolean
	payload: Prisma.InputJsonValue
}

export const createWebhookEvent = (data: NewWebhookEvent) => db.webhookEvent.create({ data })

/** A redelivery succeeded where an earlier attempt could not verify the event. */
export const refreshWebhookEvent = (
	id: string,
	data: Pick<NewWebhookEvent, 'signatureOk' | 'payload'>
) => db.webhookEvent.update({ where: { id }, data })

/** `note` explains why an event was settled without effect - null when it applied cleanly. */
export const markWebhookProcessed = (id: string, note: string | null) =>
	db.webhookEvent.update({
		where: { id },
		data: { processedAt: new Date(), processError: note }
	})

/** Leaves processedAt unset so the provider's retry gets processed instead of skipped as a duplicate. */
export const markWebhookFailed = (id: string, error: string) =>
	db.webhookEvent.update({ where: { id }, data: { processError: error } })
