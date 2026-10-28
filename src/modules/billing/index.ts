import { Elysia } from 'elysia'

import { TAG } from '~/config/openapi'
import {
	cancelSubscription,
	getSubscription,
	updateSubscription
} from '~/modules/subscription/service'
import { authGuard } from '~/plugins/auth-guard'

import {
	CancelSubscriptionResponse,
	CreatePaymentHeaders,
	CreatePaymentPayload,
	CreatePaymentResponse,
	PaymentMethodsResponse,
	PaymentParams,
	PaymentResponse,
	SubscriptionResponse,
	UpdateSubscriptionPayload
} from './model'
import { createPayment, getPayment, listPaymentMethods } from './service'

export const billing = new Elysia({ prefix: '/billing', tags: [TAG.billing] })
	.use(authGuard)
	.model({
		CreatePaymentHeaders,
		CreatePaymentPayload,
		CreatePaymentResponse,
		CancelSubscriptionResponse,
		PaymentMethodsResponse,
		PaymentParams,
		PaymentResponse,
		SubscriptionResponse,
		UpdateSubscriptionPayload
	})
	.get('/methods', () => listPaymentMethods(), {
		response: 'PaymentMethodsResponse',
		detail: {
			summary: 'Способы оплаты',
			description:
				'Все способы оплаты, сгруппированные по категориям, с признаком, работает ли способ прямо сейчас. Способ выбирается парой id и provider: передайте их в method и provider при создании платежа. Плоский список только доступных способов есть в `GET /`.'
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
					'Возвращает ссылку на страницу оплаты - на неё нужно перенаправить пользователя. С `courseId` оплачивается курс, без него - премиум-подписка. Платёж остаётся в статусе `REQUIRES_PAYMENT`, пока провайдер не подтвердит оплату; доступ открывается автоматически.\n\n**Смена способа оплаты.** Неоплаченный счёт другим способом не мешает создать новый: можно начать оплату через Heleket, затем выбрать СБП или карту. Повторный запрос тем же способом возвращает его открытый счёт. Неоплаченные счета истекают через час.\n\n**Ответы 409:**\n- курс уже куплен;\n- курс ещё только анонсирован (`status: ANNOUNCED`), продажи не открыты;\n- по товару уже идёт оплата в статусе `PROCESSING`, например криптовалюта ждёт подтверждений;\n- параллельный запрос на этот же товар ещё выполняется - повторите через секунду.\n\n**Идемпотентность.** Заголовок `Idempotency-Key` делает запрос безопасным для повтора: тот же ключ с теми же параметрами вернёт тот же платёж, с другими - ошибку 422. При смене способа используйте новый ключ. Если провайдер не ответил, ключ не расходуется и запрос можно повторить с ним же.',
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.get(
		'/payments/:id',
		async ({ session, params }) => await getPayment(session.userId, params.id),
		{
			auth: true,
			params: 'PaymentParams',
			response: 'PaymentResponse',
			detail: {
				summary: 'Платёж',
				description:
					'Статус платежа текущего пользователя и что он оплачивает. Подходит для опроса после возврата со страницы оплаты: провайдер подтверждает оплату вебхуком, и после этого статус становится `CAPTURED`, а доступ уже выдан. Неоплаченная ссылка через час переводится в `EXPIRED`. Чужой или несуществующий платёж - 404.',
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.get('/subscription', async ({ session }) => await getSubscription(session.userId), {
		auth: true,
		response: 'SubscriptionResponse',
		detail: {
			summary: 'Премиум-подписка',
			description:
				'Действует ли премиум, до какой даты оплачен и включено ли автопродление. Если подписки никогда не было - все флаги `false`.',
			security: [{ bearerAuth: [] }]
		}
	})
	.patch(
		'/subscription',
		async ({ session, body }) => await updateSubscription(session.userId, body),
		{
			auth: true,
			body: 'UpdateSubscriptionPayload',
			response: 'SubscriptionResponse',
			detail: {
				summary: 'Автопродление подписки',
				description:
					'Включает или выключает автопродление. Автопродление включается само при оплате премиума через ЮKassa любым способом или банковской картой через Робокассу, если способ оплаты удалось сохранить. Вручную включить можно только при действующей подписке и сохранённом способе оплаты (`paymentMethod` в ответе; сохраняется при оплате премиума через ЮKassa или картой через Робокассу) - иначе 409. Выключение останавливает и повторные попытки автосписания. Выключение всегда проходит, оплаченный период действует до конца. Повторный запрос с тем же значением ничего не меняет.',
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
				'Отключает автопродление, как `PATCH /billing/subscription` с `autoRenew: false`. Уже оплаченный период продолжает действовать до конца.',
			security: [{ bearerAuth: [] }]
		}
	})
