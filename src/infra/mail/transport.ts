import nodemailer from 'nodemailer'

import { env } from '@/config/env'
import { logger } from '@/infra/logger'

export const transporter = nodemailer.createTransport({
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

export const verifyMailTransport = async () => {
	await transporter.verify()

	logger.info({ context: 'mail' }, 'smtp_connected')
}

export const closeMailTransport = () => {
	transporter.close()
}
