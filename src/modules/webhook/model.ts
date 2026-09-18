import { t } from 'elysia'

export const WebhookAckResponse = t.Object({
	received: t.Boolean({ examples: [true] })
})
