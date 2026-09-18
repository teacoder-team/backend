import { Elysia } from 'elysia'

import { authGuard } from '~/plugins/auth-guard'

import {
	CancelSubscriptionResponse,
	CreatePaymentPayload,
	CreatePaymentResponse,
	PaymentMethodsResponse
} from './model'
import { cancelSubscription, createPayment, listPaymentMethods } from './service'

export const billing = new Elysia({ prefix: '/billing', tags: ['Billing'] })
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
			summary: 'List payment methods',
			description:
				'Every payment method, grouped by category, with whether it is actually wired up to a working provider right now.'
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
				summary: 'Create a payment',
				description:
					'Records the payment, opens it at the provider chosen by `method`, and returns the URL to send the user to. The payment stays REQUIRES_PAYMENT until the provider confirms it. Send an `Idempotency-Key` header to safely retry without opening a second invoice.',
				security: [{ bearerAuth: [] }]
			}
		}
	)
	.delete('/cancel', async ({ session }) => await cancelSubscription(session.userId), {
		auth: true,
		response: 'CancelSubscriptionResponse',
		detail: {
			summary: 'Cancel the subscription',
			description:
				'Stops future renewal. If a paid period is still running, access continues until it ends.',
			security: [{ bearerAuth: [] }]
		}
	})
