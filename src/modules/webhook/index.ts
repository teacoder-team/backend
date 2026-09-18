import { Elysia, t } from 'elysia'

import { WebhookAckResponse } from './model'
import { receiveHeleketWebhook, receiveYookassaWebhook } from './service'

export const webhook = new Elysia({ prefix: '/webhook', tags: ['Webhooks'] })
	.model({ WebhookAckResponse })
	.post(
		'/yookassa',
		async ({ body }) => {
			await receiveYookassaWebhook(body)

			return { received: true }
		},
		{
			body: t.Any(),
			response: 'WebhookAckResponse',
			detail: {
				summary: 'YooKassa webhook',
				description:
					'Captures a raw YooKassa notification, re-fetches the payment from their API to confirm it is real (YooKassa notifications carry no signature), and logs it. No payment-status changes happen here yet.'
			}
		}
	)
	.post(
		'/heleket',
		async ({ body }) => {
			await receiveHeleketWebhook(body)

			return { received: true }
		},
		{
			body: t.Any(),
			response: 'WebhookAckResponse',
			detail: {
				summary: 'Heleket webhook',
				description:
					'Verifies the payload signature, captures the raw notification, and logs it. No payment-status changes happen here yet.'
			}
		}
	)
