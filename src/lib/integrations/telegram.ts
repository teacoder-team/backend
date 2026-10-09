import { Bot } from 'grammy'

import { createTelegramNotifier, parseChatTargets } from '@teacoder/telegram'

import { env } from '~/config/env'
import { logger } from '~/lib/logger'

export const ADMIN_CHAT_TARGETS = parseChatTargets(env.TELEGRAM_ADMIN_CHAT_IDS)

export const adminBot = env.TELEGRAM_ADMIN_BOT_TOKEN ? new Bot(env.TELEGRAM_ADMIN_BOT_TOKEN) : null

export const adminNotifier =
	env.TELEGRAM_ADMIN_BOT_TOKEN && ADMIN_CHAT_TARGETS.length
		? createTelegramNotifier({
				botToken: env.TELEGRAM_ADMIN_BOT_TOKEN,
				targets: ADMIN_CHAT_TARGETS,
				logger
			})
		: null
