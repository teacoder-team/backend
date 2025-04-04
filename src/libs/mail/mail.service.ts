import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import type { Restriction, User } from '@prisma/generated'
import { render } from '@react-email/components'

import { ResetPasswordEmail } from './templates/reset-password.template'
import { RestrictionLiftedEmail } from './templates/restriction-lifted.template'
import { RestrictionEmail } from './templates/restriction.template'

@Injectable()
export class MailService {
	public constructor(private readonly mailerService: MailerService) {}

	public async sendPasswordReset(user: User, token: string) {
		const html = await render(ResetPasswordEmail({ user, token }))

		return this.sendMail(user.email, 'Сброс пароля', html)
	}

	public async sendRestrictionEmail(
		user: User,
		restriction: Restriction,
		violations: number
	) {
		const html = await render(
			RestrictionEmail({ user, restriction, violations })
		)

		return this.sendMail(user.email, 'Ваш аккаунт был ограничен', html)
	}

	public async sendRestrictionLiftedEmail(user: User, violations: number) {
		const html = await render(RestrictionLiftedEmail({ user, violations }))

		return this.sendMail(user.email, 'Ограничение снято', html)
	}

	private sendMail(email: string, subject: string, html: string) {
		return this.mailerService.sendMail({
			to: email,
			subject,
			html
		})
	}
}
