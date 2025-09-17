import { BadRequestException, Injectable } from '@nestjs/common'
import { PaymentStatus } from '@prisma/generated'
import { addMonths } from 'date-fns'
import { YookassaService } from 'nestjs-yookassa'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class WebhookService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly yookassaService: YookassaService
	) {}

	public async handleYookassa(payload: any) {
		console.log('YOOKASSA WEBHOOK: ', payload)

		if (payload.event === 'payment.waiting_for_capture') {
			return await this.yookassaService.capturePayment(payload.object.id)
		} else if (payload.event === 'payment.succeeded')
			return await this.processPayment({
				provider: 'yookassa',
				paymentId: payload.object.metadata.payment_id,
				paymentData: payload.object
			})
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
		const payment = await this.prisma.payment.findUnique({
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

		await this.prisma.payment.update({
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

		await this.prisma.subscription.upsert({
			where: {
				userId: payment.user.id
			},
			update: {
				expiresAt,
				isActive: true
			},
			create: {
				userId: payment.user.id,
				plan: 'premium',
				startedAt: now,
				expiresAt,
				isActive: true
			}
		})
	}
}
