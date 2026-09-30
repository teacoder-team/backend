import { type Static, t } from 'elysia'

import { IntentStatus, PaymentMethod, PaymentProvider } from '@prisma/generated/client'

import { PrismaEnum } from '~/lib/utils/schema'

export const CreatePaymentPayload = t.Object(
	{
		method: PrismaEnum(PaymentMethod, {
			description: 'Способ оплаты. От него зависит, через какого провайдера пройдёт платёж.',
			examples: [PaymentMethod.BANK_CARD]
		}),
		courseId: t.Optional(
			t.String({
				description: 'Курс для покупки. Без него оплачивается премиум-подписка.',
				examples: ['b3f1c2d4-5e6f-4a7b-8c9d-0e1f2a3b4c5d']
			})
		),
		email: t.Optional(
			t.String({
				format: 'email',
				description: 'Почта для чека. Нужна, только если у аккаунта нет своей почты.',
				examples: ['torvalds.l@teacoder.com']
			})
		)
	},
	{ description: 'Что и как оплатить.' }
)

export const CreatePaymentResponse = t.Object(
	{
		paymentId: t.String({
			description: 'Идентификатор платежа в TeaCoder - его стоит указывать в обращениях в поддержку.',
			examples: ['0f2a1c3e-9b7d-4a51-8c62-1d4e5f6a7b8c']
		}),
		status: PrismaEnum(IntentStatus, {
			description: 'Статус платежа. Сразу после создания - `REQUIRES_PAYMENT`.',
			examples: [IntentStatus.REQUIRES_PAYMENT]
		}),
		provider: PrismaEnum(PaymentProvider, {
			description: 'Провайдер, через которого проходит платёж.',
			examples: [PaymentProvider.YOOKASSA]
		}),
		method: PrismaEnum(PaymentMethod, {
			description: 'Выбранный способ оплаты.',
			examples: [PaymentMethod.BANK_CARD]
		}),
		amount: t.Number({ description: 'Сумма к оплате.', examples: [449] }),
		currency: t.String({ description: 'Валюта суммы.', examples: ['RUB'] }),
		description: t.String({
			description: 'Назначение платежа, как его видит плательщик.',
			examples: ['Оплата премиум-подписки на 1 месяц']
		}),
		url: t.String({
			description: 'Страница оплаты - перенаправьте туда пользователя.',
			examples: ['https://yoomoney.ru/checkout/payments/v2/contract?orderId=...']
		})
	},
	{ description: 'Созданный платёж.' }
)

export const CancelSubscriptionResponse = t.Object(
	{
		cancelled: t.Boolean({
			description: 'Была ли активная подписка, которую отменили.',
			examples: [true]
		})
	},
	{ description: 'Результат отмены подписки.' }
)

const PaymentMethodCategoryId = t.Union(
	[t.Literal('FIAT'), t.Literal('CRYPTO'), t.Literal('STARS')],
	{ description: 'Категория: банковские способы, криптовалюта или Telegram Stars.' }
)

const PaymentMethodEntry = t.Object({
	id: PrismaEnum(PaymentMethod, {
		description: 'Идентификатор способа - передаётся в `method` при создании платежа.',
		examples: [PaymentMethod.BANK_CARD]
	}),
	name: t.String({ description: 'Название для интерфейса.', examples: ['Банковская карта'] }),
	description: t.String({
		description: 'Пояснение для интерфейса.',
		examples: ['Оплата картой российских банков']
	}),
	isAvailable: t.Boolean({
		description: 'Работает ли способ прямо сейчас.',
		examples: [true]
	})
})

const PaymentMethodCategory = t.Object({
	id: PaymentMethodCategoryId,
	name: t.String({ description: 'Название категории.', examples: ['Банковские способы'] }),
	methods: t.Array(PaymentMethodEntry, { description: 'Способы оплаты в категории.' })
})

export const PaymentMethodsResponse = t.Object(
	{
		categories: t.Array(PaymentMethodCategory)
	},
	{ description: 'Способы оплаты по категориям.' }
)

export type CreatePaymentInput = Static<typeof CreatePaymentPayload>
