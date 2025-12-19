import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
	Payment,
	PaymentMethod,
	PaymentStatus,
	Subscription,
	User
} from '@prisma/generated'
import { and, desc, eq, lte, not } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import {
	CurrencyEnum,
	DeliveryMethodEnum,
	VatCodesEnum,
	YookassaService
} from 'nestjs-yookassa'

import { DRIZZLE_DB } from '@/infra/database/drizzle/drizzle.provider'
import { payments, subscriptions, users } from '@/infra/database/drizzle/schema'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { HeleketService } from '@/libs/heleket/heleket.service'
import { MailService } from '@/libs/mail/mail.service'

@Injectable()
export class SchedulerService {
	private readonly logger = new Logger(SchedulerService.name)

	public constructor(
		@Inject(DRIZZLE_DB)
		private readonly db: NodePgDatabase,
		private readonly mailService: MailService,
		private readonly yookassaService: YookassaService,
		private readonly heleketService: HeleketService
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
		timeZone: 'Europe/Moscow'
	})
	public async handleAutoBilling() {
		const now = new Date()

		this.logger.log(
			`Start processing expired subscriptions at ${now.toISOString()}`
		)

		const expiredSubs = await this.db
			.select({
				subscription: subscriptions,
				user: users
			})
			.from(subscriptions)
			.innerJoin(users, eq(users.id, subscriptions.userId))
			.where(
				and(
					lte(subscriptions.expiresAt, now),
					eq(subscriptions.isActive, true)
				)
			)

		this.logger.log(
			`Found ${expiredSubs.length} expired active subscriptions`
		)

		for (const { subscription: sub, user } of expiredSubs) {
			try {
				if (!user.isAutoBilling) {
					await this.deactivateSubscription(
						sub.id,
						'auto-billing disabled'
					)

					this.logger.log(
						`Subscription ${sub.id} deactivated (auto-billing disabled) for user ${user.id}`
					)

					const [lastSuccess] = await this.db
						.select()
						.from(payments)
						.where(
							and(
								eq(payments.userId, user.id),
								eq(payments.status, PaymentStatus.SUCCESS)
							)
						)
						.orderBy(desc(payments.createdAt))
						.limit(1)

					const payment = await this.createPayment(
						user.id,
						sub.id,
						lastSuccess
					)

					if (
						lastSuccess.method === PaymentMethod.BANK_CARD ||
						lastSuccess.method === PaymentMethod.SBP ||
						lastSuccess.method === PaymentMethod.T_PAY
					) {
						await this.createYookassaInvoice(sub, user, payment)
					} else if (lastSuccess.method === PaymentMethod.CRYPTO) {
						await this.createHeleketInvoice(sub, user, payment)
					}

					continue
				}

				const [lastSuccess] = await this.db
					.select()
					.from(payments)
					.where(
						and(
							eq(payments.userId, user.id),
							eq(payments.status, PaymentStatus.SUCCESS),
							not(eq(payments.method, PaymentMethod.CRYPTO))
						)
					)
					.orderBy(desc(payments.createdAt))
					.limit(1)

				if (!lastSuccess) {
					this.logger.warn(
						`No successful payment for user ${user.id}`
					)

					await this.deactivateSubscription(
						sub.id,
						'no successful payment'
					)

					continue
				}

				this.logger.log(
					`Creating auto-charge for user ${user.id} using method ${lastSuccess.method} (subscription ${sub.id})`
				)

				if (
					lastSuccess.method === PaymentMethod.BANK_CARD ||
					lastSuccess.method === PaymentMethod.SBP ||
					lastSuccess.method === PaymentMethod.T_PAY
				) {
					await this.handleYookassaRecurring(sub, user, lastSuccess)
				} else {
					this.logger.warn(
						`Skipping recurring for user ${user.id}, unsupported method: ${lastSuccess.method}`
					)
				}
			} catch (err) {
				await this.deactivateSubscription(
					sub.id,
					`Scheduler error: ${err?.message ?? err}`
				)

				this.logger.error(
					`Error processing subscription ${sub.id}: ${err?.message ?? err}`
				)
			}
		}

		this.logger.log('Finished processing expired subscriptions')
	}

	private async handleYookassaRecurring(
		sub: typeof subscriptions.$inferSelect,
		user: typeof users.$inferSelect,
		lastSuccess: typeof payments.$inferSelect
	) {
		try {
			const payment = await this.createPayment(
				user.id,
				sub.id,
				lastSuccess
			)

			const result = await this.yookassaService.payments.create({
				amount: {
					value: Number(payment.amount),
					currency: CurrencyEnum.RUB
				},
				capture: true,
				description: 'Автосписание за премиум-подписку',
				payment_method_id: lastSuccess.providerPaymentId,
				receipt: {
					customer: {
						email: user.email
					},
					items: [
						{
							amount: {
								value: Number(payment.amount),
								currency: CurrencyEnum.RUB
							},
							description: 'Автосписание за премиум-подписку',
							quantity: 1,
							vat_code: VatCodesEnum.NDS_NONE
						}
					]
				},
				metadata: {
					payment_id: payment.id
				}
			})

			await this.db
				.update(payments)
				.set({
					providerPaymentId: result.id,
					metadata: JSON.stringify(result)
				})
				.where(eq(payments.id, payment.id))

			this.logger.log(
				`Auto-charge (Yookassa) created for user ${user.id}`
			)
		} catch (err) {
			await this.deactivateSubscription(
				sub.id,
				`Yookassa auto-charge failed: ${err?.message ?? err}`
			)

			this.logger.error(
				`Yookassa auto-charge failed for user ${user.id}, subscription ${sub.id}: ${err?.message ?? err}`
			)

			throw err
		}
	}

	private async createYookassaInvoice(
		sub: typeof subscriptions.$inferSelect,
		user: typeof users.$inferSelect,
		payment: typeof payments.$inferSelect
	) {
		try {
			const invoice = await this.yookassaService.invoices.create({
				payment_data: {
					amount: {
						value: Number(payment.amount),
						currency: CurrencyEnum.RUB
					},
					description:
						'Оплата счета за продление премиум-подписки на 1 месяц',
					capture: false,
					metadata: {
						payment_id: payment.id
					},
					receipt: {
						customer: {
							email: user.email
						},
						items: [
							{
								description:
									'Продление премиум-подписки на 1 месяц',
								quantity: 1,
								amount: {
									value: Number(payment.amount),
									currency: CurrencyEnum.RUB
								},
								vat_code: VatCodesEnum.NDS_NONE
							}
						]
					}
				},
				cart: [
					{
						description: 'Продление премиум-подписки на 1 месяц',
						price: {
							value: Number(payment.amount),
							currency: CurrencyEnum.RUB
						},
						quantity: 1
					}
				],
				delivery_method_data: {
					type: DeliveryMethodEnum.SELF
				},
				expires_at: new Date(
					Date.now() + 3 * 24 * 60 * 60 * 1000
				).toISOString()
			})

			await this.db
				.update(payments)
				.set({ metadata: JSON.stringify(invoice) })
				.where(eq(payments.id, payment.id))

			await this.mailService.sendSubscriptionBlockedEmail(
				user,
				payment,
				invoice.delivery_method.url
			)

			this.logger.log(
				`Yookassa invoice created for user ${user.id} (subscription ${sub.id}): ${invoice.id} ${invoice.delivery_method.url}`
			)

			return invoice
		} catch (err) {
			await this.deactivateSubscription(
				sub.id,
				`Yookassa invoice error: ${err?.message ?? err}`
			)

			this.logger.error(
				`Failed to create Yookassa invoice for user ${user.id}, subscription ${sub.id}: ${err?.message ?? err}`
			)

			throw err
		}
	}

	private async createHeleketInvoice(
		sub: typeof subscriptions.$inferSelect,
		user: typeof users.$inferSelect,
		payment: typeof payments.$inferSelect
	) {
		try {
			const invoice = await this.heleketService.createPayment({
				amount: String(payment.amount),
				currency: 'RUB',
				order_id: payment.id,
				url_return: `${process.env.HOSTS_APP}/payment/success`,
				url_success: `${process.env.HOSTS_APP}/premium`,
				url_callback: `${process.env.HOSTS_REST}/webhook/heleket`,
				lifetime: 43200
			})

			await this.mailService.sendSubscriptionBlockedEmail(
				user,
				payment,
				invoice.url
			)

			this.logger.log(
				`Heleket invoice created for user ${user.id} (subscription ${sub.id}): ${invoice.url}`
			)

			await this.db
				.update(payments)
				.set({ metadata: JSON.stringify(invoice) })
				.where(eq(payments.id, payment.id))

			return invoice
		} catch (err) {
			await this.deactivateSubscription(
				sub.id,
				`Heleket invoice error: ${err?.message ?? err}`
			)

			this.logger.error(
				`Failed to create Heleket invoice for user ${user.id}, subscription ${sub.id}: ${err?.message ?? err}`
			)

			throw err
		}
	}

	private async createPayment(
		userId: string,
		subscriptionId: string,
		lastSuccess: any
	) {
		const [payment] = await this.db
			.insert(payments)
			.values({
				userId,
				subscriptionId,
				amount: lastSuccess.amount,
				currency: 'RUB',
				method: lastSuccess.method,
				providerPaymentId: lastSuccess.providerPaymentId
			})
			.returning()

		return payment
	}

	private async deactivateSubscription(subId: string, reason: string) {
		await this.db
			.update(subscriptions)
			.set({ isActive: false })
			.where(eq(subscriptions.id, subId))

		this.logger.warn(`Subscription ${subId} deactivated: ${reason}`)
	}
}
