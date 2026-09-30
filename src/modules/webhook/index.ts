import { getForwardedIp } from '~/lib/utils/ip'
import { Elysia, t } from 'elysia'

import { WebhookAckResponse } from './model'
import { receiveHeleketWebhook, receiveYookassaWebhook } from './service'

export const webhook = new Elysia({ prefix: '/webhook', tags: ['Webhooks'] })
	.model({ WebhookAckResponse })
	.post(
		'/yookassa',
		async ({ body, request }) => {
			await receiveYookassaWebhook(body, getForwardedIp(request.headers))

			return { received: true }
		},
		{
			body: t.Any(),
			response: 'WebhookAckResponse',
			detail: {
				summary: 'YooKassa webhook',
				description:
					"Only accepted from YooKassa's documented IP ranges. Re-fetches the payment from their API (notifications carry no signature) and applies that authoritative state: a succeeded course payment is captured and the course granted; cancellations move the intent to CANCELLED/EXPIRED. Subscription payments are recorded but not processed yet. Answers 503 when YooKassa's API can't be reached, so they redeliver."
			}
		}
	)
	.post(
		'/heleket',
		async ({ body, request }) => {
			await receiveHeleketWebhook(body, getForwardedIp(request.headers))

			return { received: true }
		},
		{
			body: t.Any(),
			response: 'WebhookAckResponse',
			detail: {
				summary: 'Heleket webhook',
				description:
					"Only accepted from Heleket's documented IP, then signature-verified. A paid course invoice is captured and the course granted; failed/cancelled invoices move the intent accordingly. Subscription payments are recorded but not processed yet."
			}
		}
	)
