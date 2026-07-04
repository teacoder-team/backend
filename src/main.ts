import { Elysia } from 'elysia'
import { openapi } from '@elysiajs/openapi'
import { env } from './core/config/env'
import { logger } from './core/logger/pino'
import { errorHandler } from './core/errors/handler'
import { bootstrap } from './core/bootstrap'
import { auth } from './modules/auth'
import { session } from './modules/session'
import { root } from './modules/root'

await bootstrap()

const app = new Elysia()
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
				components: {
					securitySchemes: {
						bearerAuth: {
							type: 'http',
							scheme: 'bearer',
							bearerFormat: 'JWT',
							description:
								'Enter your valid active session token to access protected resources.',
						},
					},
				},
			},
		}),
	)
	.use(errorHandler)
	.use(root)
	.use(auth)
	.use(session)

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
