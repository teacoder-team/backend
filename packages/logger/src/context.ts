import { AsyncLocalStorage } from 'node:async_hooks'

export interface LogContext {
	requestId: string
	[key: string]: unknown
}

/** Fields stored here are merged into every log line written inside the same async flow. */
export const logContext = new AsyncLocalStorage<LogContext>()

export const extendLogContext = (fields: Record<string, unknown>) => {
	const store = logContext.getStore()

	if (store) {
		Object.assign(store, fields)
	}
}
