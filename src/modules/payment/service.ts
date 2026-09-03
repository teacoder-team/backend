import type { Payment } from '@prisma/generated/client'
import { PaymentMethod, PaymentProvider } from '@prisma/generated/client'

import { env } from '@/config/env'
import { extendLogContext } from '@/infra/logger'
import { createInvoice } from '@/infra/payments/crypto-bot'
import { createPayment as createYookassaPayment } from '@/infra/payments/yookassa'
import { findUserEmail } from '@/modules/auth/repository'
import { BadRequestError, ErrorCode, InternalError } from '@/shared/errors'
import type { InitPaymentInput } from './model'
import {
	attachProviderPayment,
	createPendingPayment,
	markPaymentFailed,
} from './repository'

const PREMIUM_PLAN = {
	amount: 449,
	currency: 'RUB',
	description: 'Оплата премиум-подписки на 1 месяц',
} as const

const RETURN_URL = env.APP_PUBLIC_URL

const PROVIDER_BY_METHOD: Record<PaymentMethod, PaymentProvider | null> = {
	[PaymentMethod.BANK_CARD]: PaymentProvider.YOOKASSA,
	[PaymentMethod.SBP]: PaymentProvider.YOOKASSA,
	[PaymentMethod.T_PAY]: PaymentProvider.YOOKASSA,
	[PaymentMethod.SBER_PAY]: PaymentProvider.YOOKASSA,
	[PaymentMethod.YOOMONEY]: PaymentProvider.YOOKASSA,
	[PaymentMethod.CRYPTO]: PaymentProvider.CRYPTO_BOT,
	[PaymentMethod.INTERNATIONAL_CARD]: null,
	[PaymentMethod.TELEGRAM_STARS]: null,
}

interface ProviderPayment {
	url: string
	providerPaymentId: string
}

const startAtProvider = async (payment: Payment): Promise<ProviderPayment> => {
	if (payment.provider === PaymentProvider.CRYPTO_BOT) {
		const invoice = await createInvoice({
			fiat: PREMIUM_PLAN.currency,
			amount: payment.amount,
			description: PREMIUM_PLAN.description,
			payload: payment.id,
			returnUrl: RETURN_URL,
		})

		return {
			url: invoice.bot_invoice_url,
			providerPaymentId: String(invoice.invoice_id),
		}
	}

	const created = await createYookassaPayment({
		amount: payment.amount,
		description: PREMIUM_PLAN.description,
		returnUrl: RETURN_URL,
		metadata: { paymentId: payment.id },
	})

	const url = created.confirmation?.confirmation_url

	if (!url) {
		throw new InternalError('Provider returned no confirmation URL')
	}

	return { url, providerPaymentId: created.id }
}

export const initPayment = async (userId: string, input: InitPaymentInput) => {
	const provider = PROVIDER_BY_METHOD[input.method]

	if (!provider) {
		throw new BadRequestError(
			`Payment method ${input.method} is not available yet`,
			ErrorCode.PAYMENT_METHOD_UNSUPPORTED,
		)
	}

	const email = (await findUserEmail(userId)) ?? input.email ?? null

	const payment = await createPendingPayment({
		userId,
		amount: PREMIUM_PLAN.amount,
		currency: PREMIUM_PLAN.currency,
		method: input.method,
		provider,
		metadata: { email, description: PREMIUM_PLAN.description },
	})

	try {
		const { url, providerPaymentId } = await startAtProvider(payment)

		await attachProviderPayment(payment.id, providerPaymentId)

		extendLogContext({
			event: 'payment_initialized',
			userId,
			paymentId: payment.id,
			provider,
			providerPaymentId,
		})

		return {
			paymentId: payment.id,
			status: payment.status,
			provider,
			method: payment.method,
			url,
		}
	} catch (err) {
		await markPaymentFailed(payment.id)

		extendLogContext({
			event: 'payment_initialization_failed',
			userId,
			paymentId: payment.id,
			provider,
			errorMessage: err instanceof Error ? err.message : String(err),
		})

		throw new BadRequestError(
			'Payment provider is unavailable, try again later',
			ErrorCode.PAYMENT_PROVIDER_ERROR,
		)
	}
}
