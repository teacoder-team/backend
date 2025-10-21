import { MailerService } from '@nestjs-modules/mailer'
import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import type {
	Payment,
	Restriction,
	Subscription,
	User
} from '@prisma/generated'
import { render } from '@react-email/components'
import { Queue } from 'bullmq'

import { EmailVerificationTemplate } from './templates/email-verification.template'
import { ResetPasswordTemplate } from './templates/reset-password.template'
import { RestrictionLiftedTemplate } from './templates/restriction-lifted.template'
import { RestrictionTemplate } from './templates/restriction.template'
import { SubscriptionSuccessTemplate } from './templates/subscription-success.template'

@Injectable()
export class MailService {
	public constructor(
		private readonly mailerService: MailerService,
		@InjectQueue('mail') private readonly queue: Queue
	) {}

	public async sendEmailVerification(user: User, token: string) {
		const html = await render(EmailVerificationTemplate({ user, token }))

		await this.queue.add(
			'send-email',
			{ email: user.email, subject: 'Верификация почты', html },
			{ removeOnComplete: true }
		)

		return true
	}

	public async sendPasswordReset(user: User, token: string) {
		const html = await render(ResetPasswordTemplate({ user, token }))

		await this.queue.add(
			'send-email',
			{ email: user.email, subject: 'Сброс пароля', html },
			{ removeOnComplete: true }
		)

		return true
	}

	public async sendSubscriptionSuccess(
		user: User,
		payment: Payment,
		subscription: Subscription
	) {
		const html = await render(
			SubscriptionSuccessTemplate({ user, payment, subscription })
		)

		await this.queue.add(
			'send-email',
			{
				email: user.email,
				subject: 'Подписка успешно активирована',
				html
			},
			{ removeOnComplete: true }
		)

		return true
	}

	public async sendRestrictionEmail(
		user: User,
		restriction: Restriction,
		violations: number
	) {
		const html = await render(
			RestrictionTemplate({ user, restriction, violations })
		)

		await this.queue.add(
			'send-email',
			{ email: user.email, subject: 'Ваш аккаунт был ограничен', html },
			{ removeOnComplete: true }
		)

		return true
	}

	public async sendRestrictionLiftedEmail(user: User, violations: number) {
		const html = await render(
			RestrictionLiftedTemplate({ user, violations })
		)

		await this.queue.add(
			'send-email',
			{ email: user.email, subject: 'Ограничение снято', html },
			{ removeOnComplete: true }
		)

		return true
	}

	public sendMail(email: string, subject: string, html: string) {
		return this.mailerService.sendMail({
			to: email,
			subject,
			html
		})
	}
}
