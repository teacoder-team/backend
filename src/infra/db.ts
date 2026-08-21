import { PrismaPg } from '@prisma/adapter-pg'
import { Prisma, PrismaClient } from '@prisma/generated/client'

import { env } from '@/config/env'
import { logger } from '@/infra/logger'

export const db = new PrismaClient({
	adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
	log: [
		{ emit: 'event', level: 'query' },
		{ emit: 'event', level: 'error' },
		{ emit: 'event', level: 'warn' },
	],
})

db.$on('query', (event: Prisma.QueryEvent) => {
	logger.debug(
		{
			context: 'database',
			query: event.query,
			params: event.params,
			duration: `${event.duration}ms`,
		},
		'sql_query_executed',
	)
})

db.$on('error', (event: Prisma.LogEvent) => {
	logger.error({ context: 'database', target: event.target }, event.message)
})

db.$on('warn', (event: Prisma.LogEvent) => {
	logger.warn({ context: 'database', target: event.target }, event.message)
})

export const connectDatabase = async () => {
	await db.$connect()
	logger.info({ context: 'database' }, 'database_connected')
}

export const disconnectDatabase = () => db.$disconnect()

export const pingDatabase = async () => {
	try {
		await db.$queryRaw`SELECT 1`
		return true
	} catch {
		return false
	}
}
