import { Elysia, t } from 'elysia'

import { TAG } from '~/config/openapi'
import { getForwardedIp } from '~/lib/utils/ip'

import { WebhookAckResponse } from './model'
import { receiveHeleketWebhook, receiveYookassaWebhook } from './service'

export const webhook = new Elysia({ prefix: '/webhook', tags: [TAG.webhooks] })
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
				summary: 'Уведомления ЮKassa',
				description:
					'Принимается только с IP-адресов ЮKassa. Уведомления ЮKassa не подписаны, поэтому состояние платежа перезапрашивается из их API и применяется уже оно: успешная оплата курса открывает доступ, отмена переводит платёж в `CANCELLED` или `EXPIRED`. Платежи за подписку сохраняются, но пока не обрабатываются.\n\nЕсли API ЮKassa недоступен, отвечает 503 - ЮKassa повторит уведомление позже.'
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
				summary: 'Уведомления Heleket',
				description:
					'Принимается только с IP-адреса Heleket и с верной подписью. Оплаченный счёт за курс открывает доступ, неуспешный или отменённый - меняет статус платежа. Платежи за подписку сохраняются, но пока не обрабатываются.'
			}
		}
	)
