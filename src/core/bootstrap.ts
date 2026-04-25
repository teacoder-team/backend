import { logger } from '@/core/logger/pino'
import { initGeoProvider } from './providers/geo'

export const bootstrap = async () => {
	const start = Date.now()

	try {
		await initGeoProvider()

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
