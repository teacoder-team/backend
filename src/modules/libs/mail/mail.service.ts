import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

import { SessionMetadata } from '@/shared/types/session-metadata.types'

@Injectable()
export class MailService {
	public constructor(private readonly mailerService: MailerService) {}

	public async sendPasswordReset(
		email: string,
		token: string,
		metadata: SessionMetadata
	) {
		console.log(email, token, metadata)
	}

	private sendMail(email: string, subject: string, html: string) {
		return this.mailerService.sendMail({
			to: email,
			subject,
			html
		})
	}
}
