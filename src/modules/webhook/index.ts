import { Elysia, t } from 'elysia'

import { TAG } from '~/config/openapi'
import { getForwardedIp } from '~/lib/utils/ip'

import {
	RobokassaNotificationPayload,
	RobokassaResultResponse,
	WebhookAckResponse
} from './model'
import {
	receiveHeleketWebhook,
	receiveProdamusWebhook,
	receiveResendWebhook,
	receiveRobokassaResult,
	receiveYookassaWebhook,
	robokassaReturnUrl
} from './service'

export const webhook = new Elysia({ prefix: '/webhook', tags: [TAG.webhooks] })
	.model({ RobokassaNotificationPayload, RobokassaResultResponse, WebhookAckResponse })
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
			parse: 'text',
			body: t.String(),
			response: 'WebhookAckResponse',
			detail: {
				summary: 'Уведомления Heleket',
				description:
					'Принимается только с IP-адреса Heleket и с верной подписью. Оплаченный счёт за курс открывает доступ, за подписку - продлевает премиум; неуспешный или отменённый - меняет статус платежа.'
			}
		}
	)
	.post(
		'/prodamus',
		async ({ body, request }) => {
			await receiveProdamusWebhook(
				body as Record<string, unknown>,
				request.headers.get('sign')
			)

			return { received: true }
		},
		{
			body: t.Any(),
			response: 'WebhookAckResponse',
			detail: {
				summary: 'Уведомления Prodamus',
				description:
					'Платёжная форма присылает уведомление на каждое изменение статуса заказа (`multipart/form-data`, подпись в заголовке `Sign`). У Prodamus нет списка IP-адресов, поэтому подпись - единственная проверка: без неё - 401, и такой запрос не сохраняется.\n\nУспешная оплата (`payment_status: success`) открывает курс или продлевает премиум, отмена и отказ банка переводят платёж в `CANCELLED` или `FAILED`.'
			}
		}
	)
	.post(
		'/robokassa/result',
		async ({ body }) => await receiveRobokassaResult(body),
		{
			body: 'RobokassaNotificationPayload',
			response: 'RobokassaResultResponse',
			detail: {
				summary: 'Уведомления Робокассы (ResultURL)',
				description:
					'Робокасса присылает уведомление об успешной оплате методом POST (`application/x-www-form-urlencoded`): `OutSum`, `InvId`, `SignatureValue`, `PaymentMethod` и `Shp_paymentId`. Подпись проверяется Паролем #2, без неё - 400. Сумма сверяется с платежом: оплата курса открывает доступ, оплата подписки продлевает премиум, успешное автосписание продлевает подписку.\n\nПовторное уведомление по тому же `InvId` ничего не начисляет повторно и получает тот же ответ `OK{InvId}`. Оплата подписки картой сохраняет её для автопродления, если рекуррентные платежи включены.'
			}
		}
	)
	.get(
		'/robokassa/success',
		({ query, redirect }) => redirect(robokassaReturnUrl(query, 'success'), 302),
		{
			query: 'RobokassaNotificationPayload',
			detail: {
				summary: 'Возврат после оплаты в Робокассе (SuccessURL)',
				description:
					'Сюда Робокасса возвращает пользователя после оплаты (метод GET). Подпись проверяется Паролем #1, после чего пользователь перенаправляется на страницу платежа на сайте, где статус обновится после уведомления ResultURL. Сам возврат оплату не подтверждает. При неверной подписи - перенаправление на главную страницу сайта.'
			}
		}
	)
	.get(
		'/robokassa/fail',
		({ query, redirect }) => redirect(robokassaReturnUrl(query, 'fail'), 302),
		{
			query: 'RobokassaNotificationPayload',
			detail: {
				summary: 'Отказ от оплаты в Робокассе (FailURL)',
				description:
					'Сюда Робокасса возвращает пользователя, если оплата не прошла или он отказался от неё (метод GET). Пользователь перенаправляется на страницу платежа на сайте: пока ссылка не истекла, можно оплатить снова или выбрать другой способ. Статус платежа этот запрос не меняет.'
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
