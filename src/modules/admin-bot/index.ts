import type { Bot, CommandContext, Context } from 'grammy'

import { type ChatTarget, type Html, isSameTarget } from '@teacoder/telegram'

import { ADMIN_CHAT_TARGETS, adminBot } from '~/lib/integrations/telegram'
import { logger } from '~/lib/logger'
import { syncLessonReleases } from '~/modules/course/jobs'

import { accessDeniedMessage, releasesSyncedMessage, startMessage } from './service'

const COMMANDS = [
	{ command: 'start', description: 'О боте и ID этого чата' },
	{ command: 'releases', description: 'Запланировать публикацию уроков по датам' }
]

const chatTargetOf = ({ chat, msg }: CommandContext<Context>): ChatTarget =>
	msg.is_topic_message && msg.message_thread_id
		? { chatId: chat.id, threadId: msg.message_thread_id }
		: { chatId: chat.id }

const isAdminChat = (target: ChatTarget) =>
	ADMIN_CHAT_TARGETS.some((entry) => entry.chatId === target.chatId)

const reply = (ctx: CommandContext<Context>, message: Html) =>
	ctx.reply(message.value, {
		parse_mode: 'HTML',
		link_preview_options: { is_disabled: true }
	})

const registerCommands = (bot: Bot) => {
	bot.command('start', async (ctx) => {
		const target = chatTargetOf(ctx)

		await reply(
			ctx,
			isAdminChat(target)
				? startMessage({
						target,
						chatType: ctx.chat.type,
						delivers: ADMIN_CHAT_TARGETS.some((entry) => isSameTarget(entry, target))
					})
				: accessDeniedMessage(target)
		)
	})

	bot.command('releases', async (ctx) => {
		const target = chatTargetOf(ctx)

		if (!isAdminChat(target)) {
			await reply(ctx, accessDeniedMessage(target))

			return
		}

		await reply(ctx, releasesSyncedMessage(await syncLessonReleases()))
	})

	bot.catch(({ error, ctx }) => {
		logger.error(
			{ context: 'admin_bot', chatId: ctx.chat?.id, err: error },
			'admin_bot_update_failed'
		)
	})
}

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
					{
						context: 'admin_bot',
						username: me.username,
						chats: ADMIN_CHAT_TARGETS.length
					},
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
