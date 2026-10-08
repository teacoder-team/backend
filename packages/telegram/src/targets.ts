/** A chat to deliver to: a user, a group, or a single topic of a forum group. */
export interface ChatTarget {
	chatId: number
	/** Forum topic (`message_thread_id`). Absent - the chat itself, or its General topic. */
	threadId?: number
}

const ENTRY = /^(-?\d+)(?::(\d+))?$/

/**
 * Parses `123456789,-1001234567890,-1001234567890:42` - user, group, group topic.
 * Throws on a malformed entry so a typo fails at startup instead of silently dropping messages.
 */
export const parseChatTargets = (value: string): ChatTarget[] =>
	value
		.split(',')
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((entry) => {
			const match = ENTRY.exec(entry)

			if (!match) {
				throw new Error(`Invalid Telegram chat target: "${entry}"`)
			}

			const [, chatId, threadId] = match

			return threadId
				? { chatId: Number(chatId), threadId: Number(threadId) }
				: { chatId: Number(chatId) }
		})

/** Inverse of `parseChatTargets` for a single entry. */
export const formatChatTarget = ({ chatId, threadId }: ChatTarget) =>
	threadId ? `${chatId}:${threadId}` : String(chatId)

export const isSameTarget = (a: ChatTarget, b: ChatTarget) =>
	a.chatId === b.chatId && (a.threadId ?? null) === (b.threadId ?? null)
