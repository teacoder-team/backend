import type { MailerOptions } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

import type { AllConfigs } from '../definitions'

export function getMailerConfig(
	configService: ConfigService<AllConfigs>
): MailerOptions {
	return {
		transport: {
			host: configService.get('mailer.host', { infer: true }),
			port: configService.get('mailer.port', { infer: true }),
			secure: false,
			auth: {
				user: configService.get('mailer.login', { infer: true }),
				pass: configService.get('mailer.password', { infer: true })
			}
		},
		defaults: {
			from: `"TeaCoder Team" ${configService.get('mailer.login', { infer: true })}`
		}
	}
}
