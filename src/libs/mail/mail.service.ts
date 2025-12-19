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

import { payments } from '@/infra/database/drizzle/schema'
import { PaymentEntity } from '@/modules/payment/domain/entities/payment.entity'
import { SubscriptionEntity } from '@/modules/payment/domain/repositories/subscription.repository.port'
import { UserEntity } from '@/modules/payment/domain/repositories/user.repository.port'

import { EmailVerificationTemplate } from './templates/email-verification.template'
import { ResetPasswordTemplate } from './templates/reset-password.template'
import { RestrictionLiftedTemplate } from './templates/restriction-lifted.template'
import { RestrictionTemplate } from './templates/restriction.template'
import { SubscriptionBlockedTemplate } from './templates/subscription-blocked.template'
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
		user: UserEntity,
		payment: PaymentEntity,
		subscription: SubscriptionEntity
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

	public async sendSubscriptionBlockedEmail(
		user: User,
		payment: typeof payments.$inferSelect,
		payUrl: string
	) {
		const html = await render(
			SubscriptionBlockedTemplate({ user, payment, payUrl })
		)

		await this.queue.add(
			'send-email',
			{
				email: user.email,
				subject: 'Ваша подписка приостановлена',
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
