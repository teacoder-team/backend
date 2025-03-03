import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import type { User } from '@prisma/generated'
import { render } from '@react-email/components'

import { ResetPasswordEmail } from './templates/reset-password.template'

@Injectable()
export class MailService {
	public constructor(private readonly mailerService: MailerService) {}

	public async sendPasswordReset(user: User, token: string) {
		const html = await render(ResetPasswordEmail({ user, token }))

		return this.sendMail(user.email, 'Сброс пароля', html)
	}

	private sendMail(email: string, subject: string, html: string) {
		return this.mailerService.sendMail({
			to: email,
			subject,
			html
		})
	}
}
