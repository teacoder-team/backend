import { AsyncLocalStorage } from 'node:async_hooks'

import pino from 'pino'

import { env, isDevelopment } from '@/config/env'

export interface LogContext {
	requestId: string
	userId?: string
}

export const logContext = new AsyncLocalStorage<LogContext>()

const formatters = {
	level: (label: string) => ({ level: label.toUpperCase() }),
}

const serializers = {
	err: (err: unknown) =>
		err instanceof Error
			? {
					type: err.constructor.name,
					message: err.message,
					stack: err.stack,
				}
			: err,
}

const transport = isDevelopment
	? pino.transport({
			target: 'pino-pretty',
			options: {
				colorize: true,
				ignore: 'pid,hostname',
				translateTime: 'HH:MM:ss Z',
			},
		})
	: pino.destination(1)

export const logger = pino(
	{
		level: env.LOG_LEVEL,
		formatters,
		serializers,
		mixin: () => ({ ...logContext.getStore() }),
	},
	transport,
)
