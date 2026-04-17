import { registerAs } from '@nestjs/config'

import type { MailerConfig } from '../definitions'
import { validateEnv } from '../utils/validate-env'
import { MailerValidator } from '../validators'

export const mailerEnv = registerAs<MailerConfig>('mailer', () => {
	validateEnv(process.env, MailerValidator)

	return {
		host: process.env.MAIL_HOST,
		port: Number(process.env.MAIL_PORT),
		login: process.env.MAIL_LOGIN,
		password: process.env.MAIL_PASSWORD,
		fromAddress: process.env.MAIL_FROM_ADDRESS
	}
})
