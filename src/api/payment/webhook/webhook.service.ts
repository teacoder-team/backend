import {
	BadRequestException,
	Injectable,
	Logger,
	UnauthorizedException
} from '@nestjs/common'
import {
	PaymentMethod,
	PaymentProvider,
	PaymentStatus
} from '@prisma/generated'
import CidrMatcher from 'cidr-matcher'
import { addMonths } from 'date-fns'
import { YookassaService } from 'nestjs-yookassa'

import { BotService } from '@/bot/bot.service'
import { IS_DEV_ENV } from '@/common/utils'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { HeleketPaymentStatus } from '@/libs/heleket/enums'

import { HeleketPaymentWebhookResponse } from './dto'

@Injectable()
export class WebhookService {
	private readonly logger = new Logger(WebhookService.name)

	private readonly ALLOWED_IPS: string[]
	private readonly matcher: CidrMatcher

	private readonly paymentTypeMap: Record<string, PaymentMethod> = {
		bank_card: 'BANK_CARD',
		sbp: 'SBP'
	}

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly yookassaService: YookassaService,
		private readonly botService: BotService
	) {
		this.ALLOWED_IPS = [
			'185.71.76.0/27',
			'185.71.77.0/27',
			'77.75.153.0/25',
			'77.75.156.11/32',
			'77.75.156.35/32',
			'77.75.154.128/25',
			'2a02:5180::/32'
		]

		this.matcher = new CidrMatcher(this.ALLOWED_IPS)
	}

	public async handleYookassa(payload: any) {
		this.logger.log(`Received YooKassa webhook: ${payload.event}`)

		if (payload.event === 'payment.waiting_for_capture') {
			this.logger.log(`Capturing payment ${payload.object.id}`)

			return await this.yookassaService.capturePayment(payload.object.id)
		} else if (payload.event === 'payment.succeeded') {
			this.logger.log(`Payment succeeded: ${payload.object.id}`)

			return await this.processPayment({
				provider: 'yookassa',
				paymentId: payload.object.metadata.payment_id,
				paymentData: payload.object
			})
		} else if (payload.event === 'payment.canceled') {
			this.logger.warn(`Payment canceled: ${payload.object.id}`)

			return await this.prismaService.payment.update({
				where: {
					id: payload.object.metadata.payment_id
				},
				data: {
					status: PaymentStatus.FAILED
				}
			})
		}
	}

	public verifyWebhook(ip: string) {
		if (IS_DEV_ENV) {
			this.logger.debug(`Skipping IP verification in dev mode`)
			return
		}

		if (!this.matcher.contains(ip)) {
			this.logger.warn(`Unauthorized IP: ${ip}`)

			throw new UnauthorizedException(`Invalid IP: ${ip}`)
		}
	}

	public async handleRobokassa(payload: any) {
		return await this.processPayment({
			provider: 'robokassa',
			paymentId: payload.Shp_paymentId,
			paymentData: payload
		})
	}

	public async handleCrypto(payload: HeleketPaymentWebhookResponse) {
		this.logger.log(
			`Received Heleket webhook: ${payload.uuid}, status=${payload.status}`
		)

		if (
			payload.status === HeleketPaymentStatus.PAID ||
			payload.status === HeleketPaymentStatus.PAID_OVER
		) {
			this.logger.log(
				`Processing successful crypto payment ${payload.order_id}`
			)

			return await this.processPayment({
				provider: 'crypto',
				paymentId: payload.order_id,
				paymentData: payload
			})
		} else if (payload.status === 'fail') {
			this.logger.warn(`Crypto payment failed: ${payload.order_id}`)

			return await this.prismaService.payment.update({
				where: {
					id: payload.order_id
				},
				data: {
					status: PaymentStatus.FAILED
				}
			})
		}
	}

	private async processPayment({
		provider,
		paymentId,
		paymentData
	}: {
		provider: 'yookassa' | 'robokassa' | 'crypto'
		paymentId: string
		paymentData: any
	}) {
		this.logger.log(`Processing payment: ${paymentId} [${provider}]`)

		const payment = await this.prismaService.payment.findUnique({
			where: {
				id: paymentId
			},
			include: {
				user: {
					include: {
						subscription: true
					}
				}
			}
		})

		if (!payment) {
			this.logger.error(`Payment not found: ${paymentId}`)
			throw new BadRequestException('Payment not found')
		}

		let paymentMethodId = null

		if (provider === 'yookassa') {
			this.logger.log(`Saving payment method for user ${payment.user.id}`)

			const method = await this.savePaymentMethod(
				payment.user.id,
				paymentData.payment_method
			)

			paymentMethodId = method.id
		}

		await this.prismaService.payment.update({
			where: {
				id: paymentId
			},
			data: {
				status: PaymentStatus.SUCCESS,
				...(provider === 'crypto' && {
					currency: paymentData.payer_currency,
					amount: parseFloat(paymentData.payer_amount)
				}),
				metadata: paymentData,
				...(paymentMethodId && { paymentMethodId })
			}
		})

		this.logger.log(`Payment ${paymentId} marked as SUCCESS`)

		const now = new Date()

		let expiresAt = payment.user.subscription?.expiresAt ?? now

		if (expiresAt < now) expiresAt = now

		expiresAt = addMonths(expiresAt, 1)

		const subscription = await this.prismaService.subscription.upsert({
			where: {
				userId: payment.user.id
			},
			update: {
				expiresAt,
				isActive: true
			},
			create: {
				startedAt: now,
				expiresAt,
				isActive: true,
				user: {
					connect: {
						id: payment.user.id
					}
				}
			}
		})

		this.logger.log(
			`Subscription updated for user ${payment.user.id} until ${expiresAt.toISOString()}`
		)

		await this.botService.sendSubscriptionPurchased(
			payment.user,
			payment,
			subscription
		)
	}

	private async savePaymentMethod(userId: string, metadata: any) {
		const { id, type, title, card, status } = metadata

		this.logger.debug(`Upserting payment method ${id} for user ${userId}`)

		const method = await this.prismaService.userPaymentMethod.upsert({
			where: {
				providerId: id
			},
			update: {
				title,
				type: this.paymentTypeMap[type],
				...(card && {
					first6: card.first6,
					last4: card.last4,
					cardType: card.card_type,
					expiryMonth: parseInt(card.expiry_month),
					expiryYear: parseInt(card.expiry_year)
				}),
				isActive: status === 'active',
				metadata
			},
			create: {
				title,
				type: this.paymentTypeMap[type],
				provider: PaymentProvider.YOOKASSA,
				providerId: id,
				...(card && {
					first6: card.first6,
					last4: card.last4,
					cardType: card.card_type,
					expiryMonth: parseInt(card.expiry_month),
					expiryYear: parseInt(card.expiry_year)
				}),
				isActive: status === 'active',
				metadata,
				user: {
					connect: {
						id: userId
					}
				}
			}
		})

		this.logger.log(`Payment method ${method.id} saved for user ${userId}`)

		return method
	}
}
