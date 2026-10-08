import { t } from 'elysia'

export const WebhookAckResponse = t.Object(
	{
		received: t.Boolean({ description: 'Уведомление принято.', examples: [true] })
	},
	{ description: 'Подтверждение для провайдера.' }
)
