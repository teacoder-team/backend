import { Elysia } from 'elysia'

import { authGuard } from '@/plugins/auth-guard'
import { ok } from '@/shared/api'
import { InitPaymentPayload, InitPaymentResponse } from './model'
import { initPayment } from './service'

export const payment = new Elysia({ prefix: '/payments', tags: ['Payments'] })
	.use(authGuard)
	.model({ InitPaymentPayload, InitPaymentResponse })
	.post(
		'/init',
		async ({ session, body }) =>
			ok(await initPayment(session.userId, body)),
		{
			auth: true,
			body: 'InitPaymentPayload',
			response: 'InitPaymentResponse',
			detail: {
				summary: 'Initialize a payment',
				description:
					'Records the payment, opens it at the provider chosen by `method`, and returns the URL to send the user to. The payment stays PENDING until the provider confirms it.',
				security: [{ bearerAuth: [] }],
			},
		},
	)
