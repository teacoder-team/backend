import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import { authGuard } from '~/plugins/auth-guard'

import {
	CancelSubscriptionResponse,
	CreatePaymentHeaders,
	CreatePaymentPayload,
	CreatePaymentResponse,
	PaymentMethodsResponse
} from './model'
import { cancelSubscription, createPayment, listPaymentMethods } from './service'

export const billing = new Elysia({ prefix: '/billing', tags: [TAG.billing] })
	.use(authGuard)
	.model({
		CreatePaymentHeaders,
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
			headers: 'CreatePaymentHeaders',
			body: 'CreatePaymentPayload',
			response: 'CreatePaymentResponse',
			detail: {
				summary: 'Создание платежа',
				description:
					'Возвращает ссылку на страницу оплаты - на неё нужно перенаправить пользователя. С `courseId` оплачивается курс, без него - премиум-подписка. Платёж остаётся в статусе `REQUIRES_PAYMENT`, пока провайдер не подтвердит оплату; доступ к курсу открывается автоматически.\n\n**Один открытый счёт на товар.** Если у пользователя уже есть неоплаченный счёт на этот курс (или подписку) тем же способом - вернётся он, новый не создаётся. Счёт считается открытым час, потом истекает.\n\n**Ответы 409:**\n- курс уже куплен;\n- открыт неоплаченный счёт другим способом - его нужно оплатить или дождаться, пока он истечёт (время указано в ошибке);\n- по товару уже идёт оплата (например, криптовалюта ждёт подтверждений);\n- параллельный запрос на этот же товар ещё выполняется - повторите через секунду.\n\n**Идемпотентность.** Заголовок `Idempotency-Key` делает запрос безопасным для повтора: тот же ключ с теми же параметрами вернёт тот же платёж, с другими - ошибку 422. Если провайдер не ответил, ключ не расходуется и запрос можно повторить с ним же.',
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
