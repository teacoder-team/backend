import { createApp } from '@/app'
import { bootstrap, shutdown } from '@/bootstrap'
import { env } from '@/config/env'
import { logger } from '@/infra/logger'

await bootstrap()

const app = createApp().listen(
	{ hostname: env.APP_ADDRESS, port: env.APP_PORT },
	({ hostname, port }) => {
		logger.info(
			{
				context: 'server',
				network: { host: hostname, port, url: env.APP_PUBLIC_URL },
				environment: env.NODE_ENV,
				runtime: { bun: Bun.version, platform: process.platform },
			},
			'server_listening',
		)
	},
)

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
	process.once(signal, async () => {
		await app.stop()
		await shutdown()
		process.exit(0)
	})
}
