import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { node } from '@elysiajs/node'
import { env } from './core/config/env'
import { logger } from './core/logger/pino'
import { accountRouter } from './routers/account'
import { sessionRouter } from './routers/session'
import { errorHandler } from './core/errors/handler'

const app = new Elysia({ adapter: node() })
	.use(
		swagger({
			path: '/docs',
			documentation: {
				info: {
					title: 'TeaCoder API',
					description: 'API for Teacoder educational platform',
					version: '1.0.0',
					contact: {
						name: 'Send email to TeaCoder Support',
						email: 'support@teacoder.ru',
						url: 'https://teacoder.ru',
					},
					termsOfService: 'https://teacoder.ru/document/terms-of-use',
				},
			},
		}),
	)
	.use(errorHandler)
	.get('/health', () => ({
		status: 'up',
		timestamp: new Date().toISOString(),
	}))
	.use(accountRouter)
	.use(sessionRouter)

app.listen(
	{
		hostname: env.APP_ADDRESS,
		port: env.APP_PORT,
	},
	({ hostname, port }) => {
		logger.info(
			{
				instance: 'teacoder-api',
				version: '1.0.0',
				runtime: {
					node: process.version,
					platform: process.platform,
					arch: process.arch,
				},
				network: {
					host: hostname,
					port,
					url: env.APP_PUBLIC_URL,
				},
				environment: env.NODE_ENV,
			},
			'Server is running and accepting connections',
		)
	},
)
