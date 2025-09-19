import {
	BadRequestException,
	Injectable,
	MethodNotAllowedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PaymentMethod, type User } from '@prisma/generated'
import {
	ConfirmationEnum,
	CurrencyEnum,
	type PaymentCreateRequest,
	PaymentMethodsEnum,
	YookassaService
} from 'nestjs-yookassa'
import { VatCodesEnum } from 'nestjs-yookassa/dist/interfaces/receipt-details.interface'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { HeleketService } from '@/libs/heleket/heleket.service'

import { InitPaymentRequest } from './dto'

@Injectable()
export class PaymentService {
	private readonly HOSTS_APP: string
	private readonly HOSTS_REST: string

	private readonly SUBSCRIPTION_PRICE = 349

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly yookassaService: YookassaService,
		private readonly heleketService: HeleketService
	) {
		this.HOSTS_APP = this.configService.getOrThrow<string>('HOSTS_APP')
		this.HOSTS_REST = this.configService.getOrThrow<string>('HOSTS_REST')
	}

	public async create(dto: InitPaymentRequest, user: User) {
		const { method } = dto

		const payment = await this.prismaService.payment.create({
			data: {
				amount: this.SUBSCRIPTION_PRICE,
				currency: 'RUB',
				method,
				user: {
					connect: {
						id: user.id
					}
				}
			}
		})

		let providerResponse

		switch (method) {
			case PaymentMethod.BANK_CARD:
				providerResponse = await this.yookassaService.createPayment(
					this.createYooKassaPaymentData(
						payment.id,
						user,
						PaymentMethodsEnum.bank_card
					)
				)
				break
			case PaymentMethod.SBP:
				providerResponse = await this.yookassaService.createPayment(
					this.createYooKassaPaymentData(
						payment.id,
						user,
						PaymentMethodsEnum.sbp
					)
				)
				break
			case PaymentMethod.YOOMONEY:
				providerResponse = await this.yookassaService.createPayment(
					this.createYooKassaPaymentData(
						payment.id,
						user,
						PaymentMethodsEnum.yoo_money
					)
				)
				break
			case PaymentMethod.CRYPTO:
				providerResponse = await this.heleketService.createPayment({
					amount: String(this.SUBSCRIPTION_PRICE),
					currency: 'RUB',
					order_id: payment.id,
					url_return: `${this.HOSTS_APP}/payment/success`,
					url_success: `${this.HOSTS_APP}/premium`,
					url_callback: `${this.HOSTS_REST}/webhook/crypto`
				})
				break
			default:
				throw new BadRequestException('Unsupported payment provider')
		}

		await this.prismaService.payment.update({
			where: {
				id: payment.id
			},
			data: {
				providerPaymentId:
					providerResponse?.id ?? providerResponse?.uuid,
				metadata: providerResponse
			}
		})

		return {
			url:
				providerResponse?.confirmation?.confirmation_url ||
				providerResponse?.url
		}
	}

	private createYooKassaPaymentData(
		paymentId: string,
		user: User,
		paymentMethod: PaymentMethodsEnum
	): PaymentCreateRequest {
		return {
			amount: {
				value: this.SUBSCRIPTION_PRICE,
				currency: CurrencyEnum.RUB
			},
			description: 'Оплата премиум-подписки на 1 месяц',
			receipt: {
				customer: {
					email: user.email
				},
				items: [
					{
						amount: {
							value: this.SUBSCRIPTION_PRICE,
							currency: CurrencyEnum.RUB
						},
						description: 'Премиум-доступ на 30 дней',
						quantity: 1,
						vat_code: VatCodesEnum.ndsNone
					}
				]
			},
			payment_method_data: {
				// @ts-ignore
				type: paymentMethod
			},
			confirmation: {
				type: ConfirmationEnum.redirect,
				return_url: `${this.HOSTS_APP}/payment/success`
			},
			save_payment_method: true,
			...(paymentMethod === 'sbp' && {
				capture: true
			}),
			metadata: {
				payment_id: paymentId
			},
			merchant_customer_id: user.id
		}
	}
}
