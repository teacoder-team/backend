import { transporter } from './transporter'
import { env } from '@/core/config/env'
import { logger } from '@/core/logger/pino'

export type MailSenderType = 'hello' | 'noreply'

interface SendMailOptions {
	to: string
	subject: string
	html: string
	text?: string
	sender?: MailSenderType
}

const SENDER_MAP: Record<MailSenderType, string> = {
	hello: `TeaCoder <${env.SMTP_FROM_HELLO}>`,
	noreply: `TeaCoder <${env.SMTP_FROM_NOREPLY}>`,
}

export const mailClient = {
	async send({
		to,
		subject,
		html,
		text,
		sender = 'noreply',
	}: SendMailOptions) {
		const from = SENDER_MAP[sender]

		try {
			const info = await transporter.sendMail({
				from,
				to,
				subject,
				html,
				text:
					text ||
					'Please view this email in an HTML-compatible client.',
			})

			logger.info(
				{
					context: 'mail',
					messageId: info.messageId,
					to,
					sender,
				},
				'email_successfully_sent',
			)

			return info
		} catch (error) {
			logger.error(
				{
					context: 'mail',
					err: error,
					to,
					sender,
				},
				'email_delivery_failed',
			)
			throw error
		}
	},
}
