import type { Prisma } from '@prisma/generated/client'

import { db } from '~/infra/db'

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
