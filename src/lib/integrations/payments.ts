import { createCryptoBotClient } from '@teacoder/payments/crypto-bot'
import { createHeleketClient } from '@teacoder/payments/heleket'
import {
	createProdamusClient,
	WORLD_PAYMENT_METHOD_GROUPS,
	YANDEX_SPLIT_PAYMENT_METHODS
} from '@teacoder/payments/prodamus'
import { createRobokassaClient } from '@teacoder/payments/robokassa'
import { createTelegramStarsClient } from '@teacoder/payments/telegram-stars'
import { createYookassaClient, type PaymentMethodType } from '@teacoder/payments/yookassa'

import { type PaymentIntent, PaymentMethod, PaymentProvider } from '@prisma/generated/client'

import { env } from '~/config/env'
import { BadRequestError, InternalError } from '~/lib/errors'
import { logger } from '~/lib/logger'

export const yookassa = createYookassaClient({
	shopId: env.YOOKASSA_SHOP_ID,
	secretKey: env.YOOKASSA_SECRET_KEY,
	logger
})

export const heleket = createHeleketClient({
	merchantId: env.HELEKET_MERCHANT_ID,
	apiKey: env.HELEKET_PAYMENT_API_KEY,
	logger
})

export const prodamus = createProdamusClient({
	formUrl: env.PRODAMUS_FORM_URL,
	secretKey: env.PRODAMUS_SECRET_KEY,
	demoMode: env.PRODAMUS_DEMO_MODE
})

export const cryptoBot = createCryptoBotClient({
	token: env.CRYPTO_BOT_TOKEN,
	testnet: env.CRYPTO_BOT_TESTNET,
	logger
})

export const robokassa = createRobokassaClient({
	merchantLogin: env.ROBOKASSA_MERCHANT_LOGIN,
	password1: env.ROBOKASSA_TEST_MODE ? env.ROBOKASSA_TEST_PASSWORD_1 : env.ROBOKASSA_PASSWORD_1,
	password2: env.ROBOKASSA_TEST_MODE ? env.ROBOKASSA_TEST_PASSWORD_2 : env.ROBOKASSA_PASSWORD_2,
	hashAlgorithm: env.ROBOKASSA_HASH_ALGORITHM,
	testMode: env.ROBOKASSA_TEST_MODE
})

export const telegramStars = createTelegramStarsClient({
	botToken: env.TELEGRAM_PUBLIC_BOT_TOKEN,
	webhookSecret: env.TELEGRAM_PUBLIC_BOT_WEBHOOK_SECRET,
	logger
})

const CURRENCY = 'RUB'

export interface CheckoutProduct {
	kind: 'subscription' | 'course'
	amount: number
	description: string
	courseId?: string

	months?: number
	stars?: number
}

export const createProviderCheckout = async (
	payment: PaymentIntent,
	product: CheckoutProduct,
	email: string | null,
	lifetime: number
) => {
	switch (payment.provider) {
		case PaymentProvider.YOOKASSA: {
			const created = await yookassa.createPayment({
				amount: payment.amount,
				description: product.description,
				returnUrl: env.APP_URL,
				metadata: {
					paymentId: payment.id
				},
				paymentMethodType: yookassaMethodType(payment.method),
				savePaymentMethod: true
			})

			const url = created.confirmation?.confirmation_url

			if (!url) {
				throw new InternalError('Provider returned no confirmation URL')
			}

			return { url, pspIntentId: created.id, raw: created }
		}

		case PaymentProvider.ROBOKASSA: {
			const recurring = product.kind === 'subscription'

			const url = robokassa.createInvoiceUrl({
				invoiceId: payment.invoiceNumber,
				amount: payment.amount,
				description: product.description,
				email: email ?? undefined,
				recurring,
				customParams: { paymentId: payment.id }
			})

			return { url, pspIntentId: String(payment.invoiceNumber), raw: undefined }
		}

		case PaymentProvider.PRODAMUS: {
			const url = prodamus.createPaymentUrl({
				orderId: payment.id,
				products: [{ name: product.description, price: payment.amount, quantity: 1 }],
				customerEmail: email ?? undefined,
				paymentMethods:
					payment.method === PaymentMethod.YANDEX_SPLIT
						? YANDEX_SPLIT_PAYMENT_METHODS
						: undefined,
				paymentMethodGroups:
					payment.method === PaymentMethod.INTERNATIONAL_CARD
						? WORLD_PAYMENT_METHOD_GROUPS
						: undefined,
				successUrl: `${env.APP_URL}/payment/success`,
				returnUrl: env.APP_URL,
				callbackUrl: `${env.WEBHOOK_URL}/webhook/prodamus`
			})

			return { url, pspIntentId: null, raw: undefined }
		}

		case PaymentProvider.CRYPTO_BOT: {
			const invoice = await cryptoBot.createInvoice({
				fiat: CURRENCY,
				amount: payment.amount,
				description: product.description,
				payload: payment.id,
				returnUrl: env.APP_URL,
				expiresIn: lifetime
			})

			return {
				url: invoice.bot_invoice_url,
				pspIntentId: String(invoice.invoice_id),
				raw: invoice
			}
		}

		case PaymentProvider.HELEKET: {
			const invoice = await heleket.createInvoice({
				orderId: payment.id,
				amount: payment.amount,
				returnUrl: env.APP_URL,
				callbackUrl: `${env.WEBHOOK_URL}/webhook/heleket`,
				lifetime,
				additionalData: product.description
			})

			return { url: invoice.url, pspIntentId: invoice.uuid, raw: invoice }
		}

		case PaymentProvider.TELEGRAM: {
			if (!product.stars) {
				throw new BadRequestError(
					'Telegram Stars pricing is not set up for this purchase yet'
				)
			}

			const url = await telegramStars.createInvoiceLink({
				title: 'TeaCoder',
				description: product.description,
				payload: payment.id,
				amount: product.stars
			})

			return { url, pspIntentId: null, raw: undefined }
		}

		default:
			throw new InternalError(`No integration wired for provider ${payment.provider}`)
	}
}

const yookassaMethodType = (method: PaymentMethod): PaymentMethodType | undefined => {
	switch (method) {
		case PaymentMethod.BANK_CARD:
			return 'bank_card'
		case PaymentMethod.SBP:
			return 'sbp'
		case PaymentMethod.T_PAY:
			return 'tinkoff_bank'
		case PaymentMethod.YOOMONEY:
			return 'yoo_money'
		case PaymentMethod.SBER_PAY:
			return 'sberbank'
		default:
			return undefined
	}
}

export const billingMethodType = (type: string) =>
	Object.values(PaymentMethod).find((method) => yookassaMethodType(method) === type)
