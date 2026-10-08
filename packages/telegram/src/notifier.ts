import { Api } from 'grammy'

import type { Html } from './html'
import { type ChatTarget, formatChatTarget } from './targets'

/** Structurally satisfied by a pino logger. */
export interface NotifierLogger {
	warn: (context: object, message: string) => void
}

export interface TelegramNotifierOptions {
	botToken: string
	targets: readonly ChatTarget[]
	logger?: NotifierLogger
}

export interface DeliveryFailure {
	target: ChatTarget
	error: unknown
}

export interface DeliveryReport {
	delivered: number
	failed: DeliveryFailure[]
}

/** Sends one message to every target in parallel. One unreachable chat never blocks the rest. */
export const createTelegramNotifier = ({ botToken, targets, logger }: TelegramNotifierOptions) => {
	const api = new Api(botToken)

	const send = async (message: Html): Promise<DeliveryReport> => {
		const results = await Promise.allSettled(
			targets.map((target) =>
				api.sendMessage(target.chatId, message.value, {
					parse_mode: 'HTML',
					link_preview_options: { is_disabled: true },
					...(target.threadId ? { message_thread_id: target.threadId } : {})
				})
			)
		)

		const failed = results.flatMap((result, index) =>
			result.status === 'rejected' ? [{ target: targets[index]!, error: result.reason }] : []
		)

		for (const { target, error } of failed) {
			logger?.warn(
				{ context: 'telegram', target: formatChatTarget(target), err: error },
				'telegram_delivery_failed'
			)
		}

		return { delivered: targets.length - failed.length, failed }
	}

	return { targets, send }
}

export type TelegramNotifier = ReturnType<typeof createTelegramNotifier>
