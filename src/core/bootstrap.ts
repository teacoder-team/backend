import { logger } from '@/core/logger/pino'
import { initGeoProvider } from './providers/geo'
import { initEmailProvider } from './providers/email-check'

export const bootstrap = async () => {
	const start = Date.now()

	try {
		await initGeoProvider()
		await initEmailProvider()

		const duration = Date.now() - start
		logger.info(
			{
				context: 'bootstrap',
				duration: `${duration}ms`,
			},
			'application_ready_to_serve',
		)
	} catch (err) {
		logger.fatal(
			{
				context: 'bootstrap',
				err: err instanceof Error ? err.message : err,
			},
			'critical_bootstrap_failure',
		)
		process.exit(1)
	}
}
