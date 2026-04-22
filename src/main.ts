import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { node } from '@elysiajs/node'
import { env } from './lib/config/env'
import { logger } from './lib/logger/pino'

const app = new Elysia({ adapter: node() })
	.use(
		swagger({
			documentation: {
				info: {
					title: 'TeaCoder API',
					description: 'API for Teacoder educational platform',
					version: '1.0.0',
				},
			},
		}),
	)
	.get('/', () => ({ status: 'ok' }))

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
			'Elysia server infrastructure initialized',
		)
	},
)
