import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'
import { node } from '@elysiajs/node'
import { env } from './core/config/env'
import { logger } from './core/logger/pino'
import { authRouter } from './routers/auth'
import { sessionRouter } from './routers/session'
import { errorHandler } from './core/errors/handler'

const app = new Elysia({ adapter: node() })
	.use(
		openapi({
			provider: 'scalar',
			path: '/docs',
			specPath: '/openapi.json',
			documentation: {
				info: {
					title: 'TeaCoder API',
					description: 'API for TeaCoder educational platform',
					version: '1.0.0',
					contact: {
						name: 'TeaCoder Support',
						email: 'support@teacoder.ru',
					},
					termsOfService:
						'https://teacoder.ru/documents/terms-of-use',
				},
			},
		}),
	)
	.use(errorHandler)
	.get('/health', () => ({
		status: 'up',
		timestamp: new Date().toISOString(),
	}))
	.use(authRouter)
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
