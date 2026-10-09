import { AsyncLocalStorage } from 'node:async_hooks'

export interface LogContext {
	requestId: string
	[key: string]: unknown
}

export const logContext = new AsyncLocalStorage<LogContext>()

export const extendLogContext = (fields: Record<string, unknown>) => {
	const store = logContext.getStore()

	if (store) {
		Object.assign(store, fields)
	}
}
