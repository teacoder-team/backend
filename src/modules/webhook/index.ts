import { getForwardedIp } from '~/shared/ip'
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
					"Only accepted from YooKassa's documented IP ranges. Re-fetches the payment from their API to confirm it is real (YooKassa notifications carry no signature), captures it, and logs it. No payment-status changes happen here yet."
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
					"Only accepted from Heleket's documented IP, then signature-verified, captured, and logged. No payment-status changes happen here yet."
			}
		}
	)
