import {
	BadRequestException,
	Injectable,
	MethodNotAllowedException
} from '@nestjs/common'
import { PaymentMethod, type User } from '@prisma/generated'
import {
	ConfirmationEnum,
	CurrencyEnum,
	PaymentMethodsEnum,
	YookassaService
} from 'nestjs-yookassa'
import { VatCodesEnum } from 'nestjs-yookassa/dist/interfaces/receipt-details.interface'

import { IS_DEV_ENV } from '@/common/utils'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { HeleketService } from '@/libs/heleket/heleket.service'

import { InitPaymentRequest } from './dto'

@Injectable()
export class PaymentService {
	private readonly SUBSCRIPTION_PRICE = 249

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly yookassaService: YookassaService,
		private readonly heleketService: HeleketService
	) {}

	public async create(dto: InitPaymentRequest, user: User) {
		const { method } = dto

		if (!IS_DEV_ENV)
			throw new MethodNotAllowedException('Method not allowed')

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
				providerResponse = await this.yookassaService.createPayment({
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
						type: PaymentMethodsEnum.bank_card
					},
					confirmation: {
						type: ConfirmationEnum.redirect,
						return_url: 'https://teacoder.ru/payment/success'
					},
					save_payment_method: true,
					metadata: {
						payment_id: payment.id
					},
					merchant_customer_id: user.id
				})
				break
			case PaymentMethod.CRYPTO:
				// providerResponse = await this.heleketService.createPayment({
				// 	// amount: String(this.SUBSCRIPTION_PRICE),
				// 	amount: '40',
				// 	currency: 'RUB',
				// 	order_id: payment.id,
				// 	url_return: 'http://localhost:14701/premium',
				// 	url_success: 'http://localhost:14701/payment/success',
				// 	url_callback:
				// 		'https://72263b5f4671.ngrok-free.app/webhook/crypto'
				// })
				throw new BadRequestException(
					'This payment method is not available yet'
				)
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

		console.log(providerResponse)

		return {
			url:
				providerResponse?.confirmation?.confirmation_url ||
				providerResponse?.url
		}
	}
}
