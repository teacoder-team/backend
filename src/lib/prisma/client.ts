import { PrismaClient, Prisma } from '@prisma/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

import { env } from '@/lib/config/env'
import { logger } from '@/lib/logger/pino'

const globalForPrisma = globalThis as unknown as {
	prisma: ReturnType<typeof createPrismaClient> | undefined
}

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

const createPrismaClient = () => {
	return new PrismaClient({
		adapter,
		log: [
			{ emit: 'event', level: 'query' },
			{ emit: 'event', level: 'error' },
			{ emit: 'event', level: 'info' },
			{ emit: 'event', level: 'warn' },
		],
	})
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = db as any

db.$on('query', (e: Prisma.QueryEvent) => {
	logger.debug(
		{
			context: 'database',
			query: e.query,
			params: e.params,
			duration: `${e.duration}ms`,
		},
		'sql_query_executed',
	)
})

db.$on('error', (e: Prisma.LogEvent) => {
	logger.error({ context: 'database', target: e.target }, e.message)
})
