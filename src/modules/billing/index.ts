import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { authGuard } from '~/plugins/auth-guard'

import {
	CancelSubscriptionResponse,
	CreatePaymentPayload,
	CreatePaymentResponse,
	PaymentMethodsResponse
} from './model'
import { cancelSubscription, createPayment, listPaymentMethods } from './service'

export const billing = new Elysia({ prefix: '/billing', tags: [TAG.billing] })
	.use(authGuard)
	.model({
		CreatePaymentPayload,
		CreatePaymentResponse,
		CancelSubscriptionResponse,
		PaymentMethodsResponse
	})
	.get('/methods', () => listPaymentMethods(), {
		response: 'PaymentMethodsResponse',
		detail: {
			summary: 'Способы оплаты',
			description:
				'Все способы оплаты, сгруппированные по категориям, с признаком, работает ли способ прямо сейчас. Плоский список только доступных способов есть в `GET /`.'
		}
	})
	.post(
		'/create',
		async ({ session, body, headers }) =>
			await createPayment(session.userId, body, headers['idempotency-key']),
		{
			auth: true,
			body: 'CreatePaymentPayload',
			response: 'CreatePaymentResponse',
			detail: {
				summary: 'Создание платежа',
				description:
					'Создаёт платёж у провайдера, выбранного по `method`, и возвращает ссылку на страницу оплаты - на неё нужно перенаправить пользователя. С `courseId` оплачивается курс, без него - премиум-подписка.\n\nПлатёж остаётся в статусе `REQUIRES_PAYMENT`, пока провайдер не подтвердит оплату; доступ к курсу открывается автоматически после подтверждения. Заголовок `Idempotency-Key` защищает от повторного счёта: запрос с тем же ключом вернёт уже созданный платёж.',
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.delete('/cancel', async ({ session }) => await cancelSubscription(session.userId), {
		auth: true,
		response: 'CancelSubscriptionResponse',
		detail: {
			summary: 'Отмена подписки',
			description:
				'Отключает автопродление. Уже оплаченный период продолжает действовать до конца.',
			security: [{ bearerAuth: [] }]
		}
	})
