import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PaymentMethod, PaymentStatus } from '@prisma/generated'
import { CurrencyEnum, YookassaService } from 'nestjs-yookassa'
import { VatCodesEnum } from 'nestjs-yookassa/dist/interfaces/receipt-details.interface'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class SchedulerService {
	private readonly logger = new Logger(SchedulerService.name)

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly yookassaService: YookassaService
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

				try {
					const payment = await this.prismaService.payment.create({
						data: {
							amount: lastSuccess.amount,
							currency: 'RUB',
							method: lastSuccess.method,
							providerPaymentId: lastSuccess.providerPaymentId,
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

					const result = await this.yookassaService.createPayment({
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
									vat_code: VatCodesEnum.ndsNone
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

					this.logger.log(`Auto-charge created for user ${user.id}`)
				} catch (err) {
					this.logger.error(
						`Failed to create auto-charge for user ${user.id}, subscription ${sub.id}: ${err?.message ?? err}`
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
}
