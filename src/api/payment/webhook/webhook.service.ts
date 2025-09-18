import {
	BadRequestException,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { PaymentStatus } from '@prisma/generated'
import CidrMatcher from 'cidr-matcher'
import { addMonths } from 'date-fns'
import { YookassaService } from 'nestjs-yookassa'

import { IS_DEV_ENV } from '@/common/utils'
import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class WebhookService {
	private readonly ALLOWED_IPS: string[]
	private readonly matcher: CidrMatcher

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly yookassaService: YookassaService
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
		if (payload.event === 'payment.waiting_for_capture') {
			return await this.yookassaService.capturePayment(payload.object.id)
		} else if (payload.event === 'payment.succeeded')
			return await this.processPayment({
				provider: 'yookassa',
				paymentId: payload.object.metadata.payment_id,
				paymentData: payload.object
			})
	}

	public verifyWebhook(ip: string) {
		if (!this.matcher.contains(ip))
			throw new UnauthorizedException(`Invalid IP: ${ip}`)
	}

	public async handleCrypto(payload: any) {
		if (payload.status !== 'paid') return

		await this.processPayment({
			provider: 'crypto',
			paymentId: payload.order_id,
			paymentData: payload
		})
	}

	private async processPayment({
		provider,
		paymentId,
		paymentData
	}: {
		provider: 'yookassa' | 'crypto'
		paymentId: string
		paymentData: any
	}) {
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

		if (!payment) throw new BadRequestException('Payment not found')

		await this.prismaService.payment.update({
			where: {
				id: paymentId
			},
			data: {
				status: PaymentStatus.SUCCESS,
				...(provider === 'crypto' && {
					currency: paymentData.payer_currency
				}),
				metadata: paymentData
			}
		})

		const now = new Date()

		let expiresAt = payment.user.subscription?.expiresAt ?? now

		if (expiresAt < now) expiresAt = now

		expiresAt = addMonths(expiresAt, 1)

		await this.prismaService.subscription.upsert({
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
	}
}
