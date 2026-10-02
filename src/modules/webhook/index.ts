import { Elysia, t } from 'elysia'

import { TAG } from '~/config/openapi'
import { getForwardedIp } from '~/lib/utils/ip'

import { WebhookAckResponse } from './model'
import { receiveHeleketWebhook, receiveResendWebhook, receiveYookassaWebhook } from './service'

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
					'Принимается только с IP-адресов ЮKassa. Уведомления ЮKassa не подписаны, поэтому состояние платежа перезапрашивается из их API и применяется уже оно: успешная оплата курса открывает доступ, оплата подписки продлевает премиум, отмена переводит платёж в `CANCELLED` или `EXPIRED`.\n\nЕсли API ЮKassa недоступен, отвечает 503 - ЮKassa повторит уведомление позже.'
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
					'Принимается только с IP-адреса Heleket и с верной подписью. Оплаченный счёт за курс открывает доступ, за подписку - продлевает премиум; неуспешный или отменённый - меняет статус платежа.'
			}
		}
	)
	.post(
		'/resend',
		async ({ body, request }) => {
			await receiveResendWebhook(body, request.headers)

			return { received: true }
		},
		{
			parse: 'text',
			body: t.String(),
			response: 'WebhookAckResponse',
			detail: {
				summary: 'Входящие письма Resend',
				description:
					'Событие `email.received` от Resend Inbound. Подпись Svix проверяется по сырому телу запроса, без неё - 401. Письма, адресованные в поддержку, пересылаются уведомлением в админ-бот Telegram; остальные события принимаются и игнорируются.'
			}
		}
	)
