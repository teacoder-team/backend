import { t } from 'elysia'

export const WebhookAckResponse = t.Object(
	{
		received: t.Boolean({ description: 'Уведомление принято.', examples: [true] })
	},
	{ description: 'Подтверждение для провайдера.' }
)

export const RobokassaResultResponse = t.String({
	description:
		'Ответ Робокассе: `OK` и номер счёта `InvId`. Любой другой ответ Робокасса считает ошибкой и повторяет уведомление.',
	examples: ['OK42']
})

export const RobokassaNotificationPayload = t.Record(t.String(), t.String(), {
	description:
		'Поля Робокассы: OutSum, InvId, SignatureValue и дополнительные Shp_* передаются строками. PaymentMethod уточняет выбранный способ оплаты.',
	examples: [{ OutSum: '449.00', InvId: '42', PaymentMethod: 'SBP' }]
})
