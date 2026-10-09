import { render } from '@react-email/render'
import type { ReactElement } from 'react'

import { env } from '~/config/env'
import { resend } from '~/lib/integrations/resend'
import { logger } from '~/lib/logger'

export type MailSender = 'hello' | 'noreply'

const SENDERS: Record<MailSender, string> = {
	hello: `TeaCoder <${env.MAIL_FROM_HELLO}>`,
	noreply: `TeaCoder <${env.MAIL_FROM_NOREPLY}>`
}

export class MailDeliveryError extends Error {
	constructor(
		readonly code: string,
		readonly statusCode: number | null,
		message: string
	) {
		super(message)
		this.name = 'MailDeliveryError'
	}
}

export interface SendMailOptions {
	to: string
	subject: string
	template: ReactElement
	sender?: MailSender
}

export const sendMail = async ({ to, subject, template, sender = 'noreply' }: SendMailOptions) => {
	const [html, text] = await Promise.all([
		render(template),
		render(template, { plainText: true })
	])

	const { data, error } = await resend.emails.send({
		from: SENDERS[sender],
		to,
		subject,
		html,
		text
	})

	if (error) {
		throw new MailDeliveryError(error.name, error.statusCode, error.message)
	}

	logger.info({ context: 'mail', emailId: data.id, sender }, 'email_sent')

	return data
}
