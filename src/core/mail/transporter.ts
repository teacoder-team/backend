import nodemailer from 'nodemailer'
import { env } from '@/core/config/env'
import { logger } from '@/core/logger/pino'

const globalForTransporter = globalThis as unknown as {
	transporter: nodemailer.Transporter | undefined
}

const createTransporter = () => {
	const client = nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: env.SMTP_PORT,
		secure: env.SMTP_SECURE,
		auth: {
			user: env.SMTP_USERNAME,
			pass: env.SMTP_PASSWORD,
		},
		pool: true,
		maxConnections: 5,
		maxMessages: 100,
	})

	client.verify((error) => {
		if (error) {
			logger.error(
				{ context: 'mail', err: error.message },
				'smtp_connection_failed',
			)
		} else {
			logger.info({ context: 'mail' }, 'smtp_connected_and_ready')
		}
	})

	return client
}

export const transporter =
	globalForTransporter.transporter ?? createTransporter()

if (env.NODE_ENV !== 'production')
	globalForTransporter.transporter = transporter
