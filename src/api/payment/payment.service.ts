import {
	BadRequestException,
	ConflictException,
	Injectable
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PaymentMethod, type User } from '@prisma/generated'
import { lookup } from 'geoip-country'
import {
	ConfirmationEnum,
	type CreatePaymentRequest,
	CurrencyEnum,
	PaymentMethodsEnum,
	YookassaService
} from 'nestjs-yookassa'
import { VatCodesEnum } from 'nestjs-yookassa/dist/modules/receipt/enums'

import type { AllConfigs } from '@/config/definitions'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { HeleketService } from '@/libs/heleket/heleket.service'
import { PaymentDo } from '@/libs/prodamus/enums'
import { ProdamusService } from '@/libs/prodamus/prodamus.service'

import { InitPaymentRequest } from './dto'

@Injectable()
export class PaymentService {
	private readonly HOSTS_APP: string
	private readonly HOSTS_REST: string

	private readonly INTERNATIONAL_METHODS: string[]
	private readonly CRYPTO_BLOCKED_COUNTRIES: string[]

	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService<AllConfigs>,
		private readonly yookassaService: YookassaService,
		private readonly prodamusService: ProdamusService,
		private readonly heleketService: HeleketService
	) {
		this.HOSTS_APP = this.configService.get('hosts.app', { infer: true })
		this.HOSTS_REST = this.configService.get('hosts.rest', { infer: true })

		this.INTERNATIONAL_METHODS = [
			'AC',
			'ACkztjp', // весь мир, кроме РФ
			'ACf', // СНГ, кроме РФ
			'ACUSDGTL', // USD worldwide (кроме РФ)
			'ACEURGTL', // EUR worldwide (кроме РФ)
			'ACBYNGTL', // Беларусь
			'ACUSDKB', // USD worldwide
			'ACEURKB' // EUR worldwide
		]

		this.CRYPTO_BLOCKED_COUNTRIES = [
			'RU',
			'CN',
			'EG',
			'DZ',
			'AF',
			'BD',
			'TN',
			'NP',
			'MA',
			'BO',
			'IQ',
			'PK',
			'KW',
			'NC',
			'XK',
			'MM',
			'MZ',
			'BI',
			'GN',
			'HT',
			'HN'
		]
	}

	public async getAvailableMethods(ip: string) {
		const countryCode = this.getCountryCode(ip)

		const methods = [
			{
				id: PaymentMethod.BANK_CARD,
				name: 'Банковская карта',
				description: 'Оплата картой российских банков',
				isAvailable: true
			},
			{
				id: PaymentMethod.SBP,
				name: 'СБП',
				description: 'Оплата через Систему быстрых платежей',
				isAvailable: true
			},
			{
				id: PaymentMethod.T_PAY,
				name: 'T-Pay',
				description: 'Оплата через приложение Т-Банка',
				isAvailable: true
			},
			{
				id: PaymentMethod.INTERNATIONAL_CARD,
				name: 'Международные карты',
				description: 'Оплата картой зарубежных банков',
				isAvailable: true
			},
			{
				id: PaymentMethod.CRYPTO,
				name: 'Криптовалюта',
				description: 'Оплата с помощью BTC, USDT, TON',
				isAvailable: true
			}
			// {
			// 	id: PaymentMethod.TELEGRAM_STARS,
			// 	name: 'Telegram Stars',
			// 	description: 'Оплата подписки через звёзды Telegram',
			// 	isAvailable: false
			// }
		]

		return methods.filter(
			m =>
				!(
					m.id === PaymentMethod.CRYPTO &&
					this.CRYPTO_BLOCKED_COUNTRIES.includes(countryCode)
				)
		)
	}

	public async create(dto: InitPaymentRequest, user: User) {
		const { method, email } = dto

		if (!user.email) {
			if (!email)
				throw new BadRequestException(
					'Email is required to proceed with the payment'
				)

			const emailExists = await this.prismaService.user.findUnique({
				where: {
					email
				}
			})

			if (emailExists)
				throw new ConflictException('This email is already in use')

			const updatedUser = await this.prismaService.user.update({
				where: {
					id: user.id
				},
				data: {
					email
				}
			})

			user = updatedUser
		}

		const payment = await this.prismaService.payment.create({
			data: {
				amount: this.getPriceForMethod(method),
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
				providerResponse = await this.yookassaService.payments.create(
					this.createYookassaPaymentData(
						payment.id,
						user,
						PaymentMethodsEnum.BANK_CARD
					)
				)
				break
			case PaymentMethod.SBP:
				providerResponse = await this.yookassaService.payments.create(
					this.createYookassaPaymentData(
						payment.id,
						user,
						PaymentMethodsEnum.SBP
					)
				)
				break
			case PaymentMethod.T_PAY:
				providerResponse = await this.yookassaService.payments.create(
					this.createYookassaPaymentData(
						payment.id,
						user,
						PaymentMethodsEnum.T_BANK
					)
				)
				break
			case PaymentMethod.SBER_PAY:
				providerResponse = await this.yookassaService.payments.create(
					this.createYookassaPaymentData(
						payment.id,
						user,
						PaymentMethodsEnum.SBERBANK
					)
				)
				break
			case PaymentMethod.INTERNATIONAL_CARD:
				providerResponse = await this.prodamusService.createPayment({
					sys: 'default',
					products: [
						{
							name: 'Премиум-доступ на 30 дней',
							price: payment.amount,
							quantity: 1
						}
					],
					customer_email: user.email,
					order_id: payment.id,
					do: PaymentDo.PAY,
					available_payment_methods:
						this.INTERNATIONAL_METHODS.join('|'),
					urlSuccess: process.env.HOSTS_APP + '/payment/success',
					urlReturn: process.env.HOSTS_APP + '/premium',
					urlNotification:
						process.env.HOSTS_REST + '/webhook/prodamus'
				})
				break
			case PaymentMethod.CRYPTO:
				providerResponse = await this.heleketService.createPayment({
					amount: String(this.getPriceForMethod(method)),
					currency: 'RUB',
					order_id: payment.id,
					url_return: `${this.HOSTS_APP}/payment/success`,
					url_success: `${this.HOSTS_APP}/premium`,
					url_callback: `${this.HOSTS_REST}/webhook/heleket`
				})
				break
			default:
				throw new BadRequestException('Unsupported payment provider')
		}

		if (payment.method !== PaymentMethod.INTERNATIONAL_CARD)
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

	private createYookassaPaymentData(
		paymentId: string,
		user: User,
		paymentMethod: PaymentMethodsEnum
	): CreatePaymentRequest {
		return {
			amount: {
				value: 10,
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
							value: 10,
							currency: CurrencyEnum.RUB
						},
						description: 'Премиум-доступ на 30 дней',
						quantity: 1,
						vat_code: VatCodesEnum.NDS_NONE
					}
				]
			},
			payment_method_data: {
				// @ts-ignore
				type: paymentMethod
			},
			confirmation: {
				type: ConfirmationEnum.REDIRECT,
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

	private getPriceForMethod(method: PaymentMethod): number {
		switch (method) {
			case PaymentMethod.INTERNATIONAL_CARD:
				return 399

			default:
				return 10
		}
	}

	private getCountryCode(ip: string) {
		const geo = lookup(ip)

		return geo.country
	}
}
