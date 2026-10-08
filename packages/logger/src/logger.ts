import pino, { type Level, type Logger } from 'pino'

import { logContext } from './context'

export interface LoggerOptions {
	level: Level
	/** Colorized, human-readable output through pino-pretty - meant for local development. */
	pretty?: boolean
}

const formatters = {
	level: (label: string) => ({ level: label.toUpperCase() })
}

const serializers = {
	err: (err: unknown) =>
		err instanceof Error
			? { type: err.constructor.name, message: err.message, stack: err.stack }
			: err
}

export const createLogger = ({ level, pretty = false }: LoggerOptions): Logger =>
	pino(
		{
			level,
			formatters,
			serializers,
			mixin: () => ({ ...logContext.getStore() })
		},
		pretty
			? pino.transport({
					target: 'pino-pretty',
					options: { colorize: true, ignore: 'pid,hostname', translateTime: 'HH:MM:ss Z' }
				})
			: pino.destination(1)
	)
