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

export const refreshWebhookEvent = (
	id: string,
	data: Pick<NewWebhookEvent, 'signatureOk' | 'payload'>
) => db.webhookEvent.update({ where: { id }, data })

export const markWebhookProcessed = (id: string, note: string | null) =>
	db.webhookEvent.update({
		where: { id },
		data: { processedAt: new Date(), processError: note }
	})

export const markWebhookFailed = (id: string, error: string) =>
	db.webhookEvent.update({ where: { id }, data: { processError: error } })
