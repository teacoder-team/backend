import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
	Payment,
	PaymentMethod,
	PaymentStatus,
	Subscription,
	User
} from '@prisma/generated'
import {
	CurrencyEnum,
	DeliveryMethodEnum,
	VatCodesEnum,
	YookassaService
} from 'nestjs-yookassa'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { HeleketService } from '@/libs/heleket/heleket.service'
import { MailService } from '@/libs/mail/mail.service'
import { RobokassaService } from '@/libs/robokassa/robokassa.service'

@Injectable()
export class SchedulerService {
	private readonly logger = new Logger(SchedulerService.name)

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService,
		private readonly yookassaService: YookassaService,
		private readonly robokassaService: RobokassaService,
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

		const subscriptions = await this.prismaService.subscription.findMany({
			where: {
				expiresAt: {
					lte: now
				},
				isActive: true
			},
			include: {
				user: true
			}
		})

		this.logger.log(
			`Found ${subscriptions.length} expired active subscriptions`
		)

		for (const sub of subscriptions) {
			try {
				const user = sub.user

				if (!user.isAutoBilling) {
					await this.prismaService.subscription.update({
						where: {
							id: sub.id
						},
						data: {
							isActive: false
						}
					})

					this.logger.log(
						`Subscription ${sub.id} deactivated (auto-billing disabled) for user ${user.id}`
					)

					const lastSuccess =
						await this.prismaService.payment.findFirst({
							where: {
								userId: user.id,
								status: PaymentStatus.SUCCESS
							},
							orderBy: {
								createdAt: 'desc'
							}
						})

					const payment = await this.prismaService.payment.create({
						data: {
							amount: 349,
							currency: 'RUB',
							method: lastSuccess.method,
							invoiceId: this.generateInvoiceId(),
							subscription: {
								connect: {
									id: sub.id
								}
							},
							user: {
								connect: {
									id: user.id
								}
							}
						}
					})

					if (
						lastSuccess.method === PaymentMethod.BANK_CARD ||
						lastSuccess.method === PaymentMethod.SBP
					) {
						await this.createYookassaInvoice(sub, user, payment)
					} else if (lastSuccess.method === PaymentMethod.CRYPTO) {
						await this.createHeleketInvoice(sub, user, payment)
					}

					continue
				}

				const lastSuccess = await this.prismaService.payment.findFirst({
					where: {
						userId: user.id,
						status: PaymentStatus.SUCCESS,
						method: {
							not: PaymentMethod.CRYPTO
						}
					},
					orderBy: {
						createdAt: 'desc'
					}
				})

				if (!lastSuccess) {
					this.logger.warn(
						`No successful payment for user ${user.id}`
					)

					await this.prismaService.subscription.update({
						where: {
							id: sub.id
						},
						data: {
							isActive: false
						}
					})

					continue
				}

				this.logger.log(
					`Creating auto-charge for user ${user.id} using method ${lastSuccess.method} (subscription ${sub.id})`
				)

				if (
					lastSuccess.method === PaymentMethod.BANK_CARD ||
					lastSuccess.method === PaymentMethod.SBP
				) {
					await this.handleYookassaRecurring(sub, user, lastSuccess)
				} else if (
					lastSuccess.method === PaymentMethod.INTERNATIONAL_CARD
				) {
					await this.handleRobokassaRecurring(sub, user, lastSuccess)
				} else {
					this.logger.warn(
						`Skipping recurring for user ${user.id}, unsupported method: ${lastSuccess.method}`
					)
				}
			} catch (err) {
				this.logger.error(
					`Error processing subscription ${sub.id}: ${err?.message ?? err}`
				)
			}
		}

		this.logger.log('Finished processing expired subscriptions')
	}

	private async handleYookassaRecurring(
		sub: Subscription,
		user: User,
		lastSuccess: Payment
	) {
		try {
			const payment = await this.prismaService.payment.create({
				data: {
					amount: lastSuccess.amount,
					currency: 'RUB',
					method: lastSuccess.method,
					providerPaymentId: lastSuccess.providerPaymentId,
					user: { connect: { id: user.id } },
					subscription: { connect: { id: sub.id } }
				}
			})

			const result = await this.yookassaService.payments.create({
				amount: {
					value: payment.amount,
					currency: CurrencyEnum.RUB
				},
				capture: true,
				description: 'Ежемесячная подписка',
				payment_method_id: lastSuccess.providerPaymentId,
				receipt: {
					customer: {
						email: user.email
					},
					items: [
						{
							amount: {
								value: payment.amount,
								currency: CurrencyEnum.RUB
							},
							description: 'Ежемесячная подписка',
							quantity: 1,
							vat_code: VatCodesEnum.NDS_NONE
						}
					]
				},
				metadata: {
					payment_id: payment.id
				}
			})

			await this.prismaService.payment.update({
				where: {
					id: payment.id
				},
				data: {
					providerPaymentId: result.id,
					metadata: JSON.stringify(result)
				}
			})

			this.logger.log(
				`Auto-charge (Yookassa) created for user ${user.id}`
			)
		} catch (err) {
			this.logger.error(
				`Yookassa auto-charge failed for user ${user.id}, subscription ${sub.id}: ${err?.message ?? err}`
			)
		}
	}

	private async handleRobokassaRecurring(
		sub: Subscription,
		user: User,
		lastSuccess: Payment
	) {
		try {
			const invoiceId = this.generateInvoiceId()

			const payment = await this.prismaService.payment.create({
				data: {
					amount: lastSuccess.amount,
					currency: 'RUB',
					method: PaymentMethod.INTERNATIONAL_CARD,
					user: {
						connect: {
							id: user.id
						}
					},
					subscription: {
						connect: {
							id: sub.id
						}
					}
				}
			})

			const result = await this.robokassaService.createRecurringPayment({
				outSum: lastSuccess.amount,
				description: 'Автопродление подписки',
				invId: invoiceId,
				previousInvoiceId: lastSuccess.invoiceId
			})

			this.logger.log(
				`Auto-charge (Robokassa) created for user ${user.id}: ${result}`
			)

			await this.prismaService.payment.update({
				where: {
					id: payment.id
				},
				data: {
					metadata: result
				}
			})

			await this.prismaService.subscription.update({
				where: {
					id: sub.id
				},
				data: {
					expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
				}
			})
		} catch (err) {
			this.logger.error(
				`Robokassa auto-charge failed for user ${user.id}, subscription ${sub.id}: ${err?.message ?? err}`
			)
		}
	}

	private async createYookassaInvoice(
		sub: Subscription,
		user: User,
		payment: Payment
	) {
		try {
			const invoice = await this.yookassaService.invoices.create({
				payment_data: {
					amount: {
						value: payment.amount,
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
									value: payment.amount,
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
							value: payment.amount,
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

			await this.prismaService.payment.update({
				where: {
					id: payment.id
				},
				data: {
					metadata: JSON.stringify(invoice)
				}
			})

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
			this.logger.error(
				`Failed to create Yookassa invoice for user ${user.id}, subscription ${sub.id}: ${err?.message ?? err}`
			)
		}
	}

	private async createHeleketInvoice(
		sub: Subscription,
		user: User,
		payment: Payment
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

			await this.prismaService.payment.update({
				where: {
					id: payment.id
				},
				data: {
					metadata: JSON.stringify(invoice)
				}
			})

			return invoice
		} catch (err) {
			this.logger.error(
				`Failed to create Heleket invoice for user ${user.id}, subscription ${sub.id}: ${err?.message ?? err}`
			)
		}
	}

	private generateInvoiceId() {
		const digits = 8

		const min = Math.pow(10, digits - 1)
		const max = Math.pow(10, digits) - 1

		return Math.floor(Math.random() * (max - min + 1)) + min
	}
}
