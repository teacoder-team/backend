import pino from 'pino'
import { getLogContext } from './context'
import { formatters, serializers } from './formatter'
import { env } from '../config/env'

const isDev = env.NODE_ENV === 'development'

const streams = []

if (isDev) {
	streams.push({
		level: 'debug',
		stream: pino.transport({
			target: 'pino-pretty',
			options: {
				colorize: true,
				ignore: 'pid,hostname',
				translateTime: 'HH:MM:ss Z',
			},
		}),
	})
} else {
	streams.push({
		level: env.LOG_LEVEL,
		stream: pino.destination(1),
	})
}

export const logger = pino(
	{
		level: env.LOG_LEVEL,
		formatters,
		serializers,
		mixin: () => {
			const context = getLogContext()
			return context ? { requestId: context.requestId } : {}
		},
	},
	pino.multistream(streams),
)
