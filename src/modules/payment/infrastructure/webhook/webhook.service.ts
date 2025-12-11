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

import { TeamanagerBotService } from '@/api/bots/teamanager/teamanager.bot.service'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { MailService } from '@/libs/mail/mail.service'
import { IS_DEV_ENV } from '@/shared/utils'

import { HeleketPaymentWebhookResponse } from './dto/heleket-webhook.dto'
import { NormalizedCallbackDto } from './dto/normalized-callback.dto'
import { WebhookMapper } from './webhook.mapper'
import { WebhookValidator } from './webhook.validator'

@Injectable()
export class WebhookService {
	private readonly logger = new Logger(WebhookService.name)

	private readonly ALLOWED_IPS: string[]
	private readonly matcher: CidrMatcher

	private readonly paymentTypeMap: Record<string, PaymentMethod> = {
		bank_card: 'BANK_CARD',
		sbp: 'SBP',
		tinkoff_bank: 'T_PAY',
		yoo_money: 'YOOMONEY'
	}

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly yookassaService: YookassaService,
		private readonly mailService: MailService,
		private readonly validator: WebhookValidator,
		private readonly mapper: WebhookMapper,
		private readonly botService: TeamanagerBotService
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

	public async handleYookassa(payload: any, ip: string) {
		this.logger.log(`➡️ Incoming YooKassa webhook: ${payload.event}`)
		this.validator.validateYooKassa(ip)

		if (payload.event === 'payment.waiting_for_capture') {
			this.logger.log(`Capturing YooKassa payment ${payload.object.id}`)
			await this.yookassaService.payments.capture(payload.object.id)
		}

		const normalized = this.mapper.fromYooKassa(payload)
		await this.processPayment(normalized)
	}

	public async handleProdamus(payload: any, signature: string) {
		this.logger.log(
			`➡️ Incoming Prodamus webhook for order ${payload.order_num}`
		)

		this.validator.validateProdamus(
			payload,
			signature,
			process.env.PRODAMUS_SECRET_KEY!
		)

		this.logger.log(
			`Prodamus signature verified for order ${payload.order_num}`
		)

		const normalized = this.mapper.fromProdamus(payload)
		await this.processPayment(normalized)
	}

	public async handleHeleket(
		payload: HeleketPaymentWebhookResponse,
		ip: string
	) {
		this.logger.log(`➡️ Incoming Heleket webhook: ${payload.uuid}`)
		this.validator.validateHeleket(ip)

		const normalized = this.mapper.fromHeleket(payload)
		await this.processPayment(normalized)
	}

	public async processPayment(dto: NormalizedCallbackDto) {
		const { provider, isSuccess, paymentId, amount, raw } = dto

		this.logger.log(`🔄 Processing payment ${paymentId} via [${provider}]`)

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
			this.logger.error(`❌ Payment not found: ${paymentId}`)
			throw new BadRequestException('Payment not found')
		}

		if (!isSuccess) {
			this.logger.warn(
				`⚠️ Payment ${paymentId} FAILED via ${provider}, marking as FAILED`
			)

			await this.prismaService.payment.update({
				where: {
					id: paymentId
				},
				data: {
					status: PaymentStatus.FAILED,
					metadata: raw
				}
			})

			return
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
				...(provider === 'heleket' && {
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
}
