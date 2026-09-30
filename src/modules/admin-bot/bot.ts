import { type ChatTarget, isSameTarget } from '@teacoder/telegram'
import type { Bot } from 'grammy'

import { ADMIN_CHAT_TARGETS, adminBot } from '~/lib/integrations/telegram'
import { logger } from '~/lib/logger'

import { accessDeniedMessage, startMessage } from './messages'

const COMMANDS = [{ command: 'start', description: 'О боте и ID этого чата' }]

const registerCommands = (bot: Bot) => {
	bot.command('start', async (ctx) => {
		const { msg } = ctx

		const target: ChatTarget =
			msg.is_topic_message && msg.message_thread_id
				? { chatId: ctx.chat.id, threadId: msg.message_thread_id }
				: { chatId: ctx.chat.id }

		const allowed = ADMIN_CHAT_TARGETS.some((entry) => entry.chatId === target.chatId)

		const message = allowed
			? startMessage({
					target,
					chatType: ctx.chat.type,
					delivers: ADMIN_CHAT_TARGETS.some((entry) => isSameTarget(entry, target))
				})
			: accessDeniedMessage(target)

		await ctx.reply(message.value, {
			parse_mode: 'HTML',
			link_preview_options: { is_disabled: true }
		})
	})

	bot.catch(({ error, ctx }) => {
		logger.error(
			{ context: 'admin_bot', chatId: ctx.chat?.id, err: error },
			'admin_bot_update_failed'
		)
	})
}

/**
 * Long polling inside the app: no public HTTPS needed, works locally. One poller per token -
 * a second instance or environment on the same token gets 409 Conflict from Telegram.
 */
export const startAdminBot = () => {
	if (!adminBot) {
		logger.info({ context: 'admin_bot' }, 'admin_bot_disabled')

		return
	}

	registerCommands(adminBot)

	void adminBot.api.setMyCommands(COMMANDS).catch((err: unknown) => {
		logger.warn({ context: 'admin_bot', err }, 'admin_bot_commands_not_set')
	})

	void adminBot
		.start({
			drop_pending_updates: true,
			allowed_updates: ['message'],
			onStart: (me) => {
				logger.info(
					{ context: 'admin_bot', username: me.username, chats: ADMIN_CHAT_TARGETS.length },
					'admin_bot_started'
				)
			}
		})
		.catch((err: unknown) => {
			logger.error({ context: 'admin_bot', err }, 'admin_bot_polling_failed')
		})
}

export const stopAdminBot = async () => {
	if (adminBot?.isRunning()) {
		await adminBot.stop()
	}
}
