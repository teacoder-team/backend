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

import { TeamanagerBotService } from '@/bots/teamanager/teamanager.bot.service'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { HeleketPaymentStatus } from '@/libs/heleket/enums'
import { MailService } from '@/libs/mail/mail.service'
import { NpdService } from '@/libs/npd/npd.service'

import { HeleketPaymentWebhookResponse } from './dto'
import { WebhookValidator } from './webhook.validator'

@Injectable()
export class WebhookService {
	private readonly logger = new Logger(WebhookService.name)

	private readonly paymentTypeMap: Record<string, PaymentMethod> = {
		bank_card: 'BANK_CARD',
		sbp: 'SBP',
		tinkoff_bank: 'T_PAY',
		yoo_money: 'YOOMONEY'
	}

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly yookassaService: YookassaService,
		private readonly validator: WebhookValidator,
		private readonly npdService: NpdService,
		private readonly mailService: MailService,
		private readonly botService: TeamanagerBotService
	) {}

	public async handleYookassa(payload: any, ip: string) {
		this.logger.log(`Incoming YooKassa webhook: ${payload.event}`)
		this.validator.validateYooKassa(ip)

		if (payload.event === 'payment.waiting_for_capture') {
			this.logger.log(`Capturing payment ${payload.object.id}`)

			return await this.yookassaService.payments.capture(
				payload.object.id
			)
		} else if (payload.event === 'payment.succeeded') {
			this.logger.log(`Payment succeeded: ${payload.object.id}`)

			return await this.processPayment({
				provider: 'yookassa',
				paymentId: payload.object.metadata.payment_id,
				raw: payload.object
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

	public async handleProdamus(payload: any, signature: string) {
		this.logger.log(
			`Incoming Prodamus webhook for order ${payload.order_num}`
		)

		this.validator.validateProdamus(
			payload,
			signature,
			process.env.PRODAMUS_SECRET_KEY!
		)

		return await this.processPayment({
			provider: 'prodamus',
			paymentId: payload.order_num,
			raw: payload
		})
	}

	public async handleCrypto(
		payload: HeleketPaymentWebhookResponse,
		ip: string
	) {
		this.logger.log(`Incoming Heleket webhook: ${payload.uuid}`)
		this.validator.validateHeleket(ip)

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
				raw: payload
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

	public async processPayment({
		provider,
		paymentId,
		raw
	}: {
		provider: 'yookassa' | 'prodamus' | 'crypto'
		paymentId: string
		raw: any
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
				raw.payment_method
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
					currency: raw.payer_currency,
					amount: parseFloat(raw.payer_amount)
				}),
				metadata: raw,
				...(paymentMethodId && { paymentMethodId })
			}
		})

		this.logger.log(`Payment ${paymentId} marked as SUCCESS`)

		if (!payment.user.isAutoBilling && provider === 'yookassa') {
			await this.prismaService.user.update({
				where: {
					id: payment.user.id
				},
				data: {
					isAutoBilling: true
				}
			})

			this.logger.log(
				`Auto-billing enabled for user ${payment.user.id} (provider: ${provider})`
			)
		}

		if (provider === 'yookassa')
			await this.createNpdReceiptSafe(payment, raw)

		const now = new Date()

		let expiresAt = payment.user.subscription?.expiresAt ?? now

		if (expiresAt < now) expiresAt = now

		expiresAt = addMonths(expiresAt, 1)

		const subscription = await this.prismaService.subscription.upsert({
			where: {
				userId: payment.user.id
			},
			update: {
				startedAt: now,
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

		await this.mailService.sendSubscriptionSuccess(
			payment.user,
			payment,
			subscription
		)

		await this.botService.sendSubscriptionPurchased(
			payment.user,
			payment,
			subscription
		)
	}

	private async savePaymentMethod(userId: string, metadata: any) {
		const { id, type, title, card, status } = metadata

		let resolvedTitle = title

		const expiryMonth =
			card?.expiry_month && /^\d+$/.test(card.expiry_month)
				? parseInt(card.expiry_month)
				: null

		const expiryYear =
			card?.expiry_year && /^\d+$/.test(card.expiry_year)
				? parseInt(card.expiry_year)
				: null

		if (type === 'tinkoff_bank') resolvedTitle = 'T-Pay'

		this.logger.debug(`Upserting payment method ${id} for user ${userId}`)

		const method = await this.prismaService.userPaymentMethod.upsert({
			where: {
				providerId: id
			},
			update: {
				title: resolvedTitle,
				type: this.paymentTypeMap[type],
				...(card && {
					first6: card.first6,
					last4: card.last4,
					cardType: card.card_type,
					expiryMonth,
					expiryYear
				}),
				isActive: status === 'active',
				metadata
			},
			create: {
				title: resolvedTitle,
				type: this.paymentTypeMap[type],
				provider: PaymentProvider.YOOKASSA,
				providerId: id,
				...(card && {
					first6: card.first6,
					last4: card.last4,
					cardType: card.card_type,
					expiryMonth,
					expiryYear
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

	private async createNpdReceiptSafe(payment: any, raw: any) {
		try {
			const receipt = await this.npdService.createIncome({
				name: 'Премиум-доступ на 30 дней',
				amount: payment.amount
			})

			await this.prismaService.receipt.create({
				data: {
					paymentId: payment.id,
					status: 'SUCCESS',
					amount: payment.amount,
					items: [
						{
							name: 'Премиум-доступ на 30 дней',
							price: payment.amount,
							quantity: 1
						}
					],
					raw: receipt,
					fiscalProviderId: receipt.receiptUuid
				}
			})

			this.logger.log(
				`NPD receipt created for payment ${payment.id}: ${receipt.receiptUuid}`
			)
		} catch (error: any) {
			this.logger.error(
				`Failed to create NPD receipt for payment ${payment.id}`,
				error?.message
			)

			await this.prismaService.receipt.create({
				data: {
					paymentId: payment.id,
					status: 'FAILED',
					amount: payment.amount,
					items: [
						{
							name: 'Премиум-доступ на 30 дней',
							price: payment.amount,
							quantity: 1
						}
					],
					errorMessage: error?.message ?? 'NPD error'
				}
			})
		}
	}
}
