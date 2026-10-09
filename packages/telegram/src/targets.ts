export interface ChatTarget {
	chatId: number

	threadId?: number
}

const ENTRY = /^(-?\d+)(?::(\d+))?$/

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

export const formatChatTarget = ({ chatId, threadId }: ChatTarget) =>
	threadId ? `${chatId}:${threadId}` : String(chatId)

export const isSameTarget = (a: ChatTarget, b: ChatTarget) =>
	a.chatId === b.chatId && (a.threadId ?? null) === (b.threadId ?? null)
