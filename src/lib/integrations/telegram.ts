import { createTelegramNotifier, parseChatTargets } from '@teacoder/telegram'
import { Bot } from 'grammy'

import { env } from '~/config/env'
import { logger } from '~/lib/logger'

/** Chats the admin bot serves and delivers notifications to. */
export const ADMIN_CHAT_TARGETS = parseChatTargets(env.TELEGRAM_ADMIN_CHAT_IDS)

/** Null without a token. Runs even with no chats configured, so /start can reveal a chat's id. */
export const adminBot = env.TELEGRAM_ADMIN_BOT_TOKEN ? new Bot(env.TELEGRAM_ADMIN_BOT_TOKEN) : null

/** Null unless there is both a token and somewhere to deliver to. */
export const adminNotifier =
	env.TELEGRAM_ADMIN_BOT_TOKEN && ADMIN_CHAT_TARGETS.length
		? createTelegramNotifier({
				botToken: env.TELEGRAM_ADMIN_BOT_TOKEN,
				targets: ADMIN_CHAT_TARGETS,
				logger
			})
		: null
