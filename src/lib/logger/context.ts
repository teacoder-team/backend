import { AsyncLocalStorage } from 'node:async_hooks'

export interface LogContext {
	requestId: string
	userId?: string
	[key: string]: unknown
}

export const loggerStorage = new AsyncLocalStorage<LogContext>()

export const getLogContext = () => loggerStorage.getStore()
