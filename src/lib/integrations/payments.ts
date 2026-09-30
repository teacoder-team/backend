import { createCryptoBotClient } from '@teacoder/payments/crypto-bot'
import { createHeleketClient } from '@teacoder/payments/heleket'
import { createRobokassaClient } from '@teacoder/payments/robokassa'
import { createTelegramStarsClient } from '@teacoder/payments/telegram-stars'
import { createYookassaClient } from '@teacoder/payments/yookassa'

import { env } from '~/config/env'
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
	botToken: env.TELEGRAM_BOT_TOKEN,
	webhookSecret: env.TELEGRAM_WEBHOOK_SECRET,
	logger
})
