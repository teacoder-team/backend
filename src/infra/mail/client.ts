import { render } from '@react-email/render'
import type { ReactElement } from 'react'

import { env } from '@/config/env'
import { logger } from '@/infra/logger'
import { transporter } from './transport'

export type MailSender = 'hello' | 'noreply'

const SENDERS: Record<MailSender, string> = {
	hello: `TeaCoder <${env.SMTP_FROM_HELLO}>`,
	noreply: `TeaCoder <${env.SMTP_FROM_NOREPLY}>`,
}

const PLAIN_TEXT_FALLBACK =
	'Please view this email in an HTML-compatible client.'

export interface SendMailOptions {
	to: string
	subject: string
	template: ReactElement
	sender?: MailSender
}

export const sendMail = async ({
	to,
	subject,
	template,
	sender = 'noreply',
}: SendMailOptions) => {
	const html = await render(template)

	const info = await transporter.sendMail({
		from: SENDERS[sender],
		to,
		subject,
		html,
		text: PLAIN_TEXT_FALLBACK,
	})

	logger.info(
		{
			context: 'mail',
			messageId: info.messageId,
			to,
			sender,
		},
		'email_sent',
	)

	return info
}
