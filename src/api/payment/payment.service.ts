import {
	BadRequestException,
	ConflictException,
	Injectable
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PaymentMethod, type User } from '@prisma/generated'
import { eq, InferSelectModel } from 'drizzle-orm'
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
import { DatabaseService } from '@/infra/database/database.service'
import { payments, users } from '@/infra/database/drizzle/schema'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { HeleketService } from '@/libs/heleket/heleket.service'
import { PaytureService } from '@/libs/payture/payture.service'
import {
	PaymentDo,
	ProductPaymentMethod,
	ProductPaymentObject,
	TaxType
} from '@/libs/prodamus/enums'
import { ProdamusService } from '@/libs/prodamus/prodamus.service'

import { InitPaymentRequest } from './dto'

@Injectable()
export class PaymentService {
	private readonly HOSTS_APP: string
	private readonly HOSTS_REST: string

	private readonly SUBSCRIPTION_PRICE = 349

	private readonly CRYPTO_BLOCKED_COUNTRIES: string[]

	public constructor(
		private readonly database: DatabaseService,
		private readonly configService: ConfigService<AllConfigs>,
		private readonly yookassaService: YookassaService,
		private readonly prodamusService: ProdamusService,
		private readonly paytureService: PaytureService,
		private readonly heleketService: HeleketService
	) {
		this.HOSTS_APP = this.configService.get('hosts.app', { infer: true })
		this.HOSTS_REST = this.configService.get('hosts.rest', { infer: true })

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
			// {
			// 	id: PaymentMethod.YOOMONEY,
			// 	name: 'ЮMoney',
			// 	description: 'Оплата через кошелек ЮMoney',
			// 	icon: YoomoneyIcon,
			// 	isAvailable: true
			// },
			{
				id: PaymentMethod.CRYPTO,
				name: 'Криптовалюта',
				description: 'Оплата с помощью BTC, USDT, TON',
				isAvailable: true
			}
			// {
			// 	id: PaymentMethod.INTERNATIONAL_CARD,
			// 	name: 'Международные карты',
			// 	description: 'Оплата картой зарубежных банков',
			// 	isAvailable: true
			// }
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

	public async create(
		dto: InitPaymentRequest,
		user: InferSelectModel<typeof users>
	) {
		const { method, email } = dto

		if (!user.email) {
			if (!email)
				throw new BadRequestException(
					'Email is required to proceed with the payment'
				)

			const [emailExists] = await this.database.db
				.select()
				.from(users)
				.where(eq(users.email, email))
				.limit(1)

			if (emailExists)
				throw new ConflictException('This email is already in use')

			const [updatedUser] = await this.database.db
				.update(users)
				.set({ email })
				.where(eq(users.id, user.id))
				.returning()

			user = updatedUser
		}

		const [payment] = await this.database.db
			.insert(payments)
			.values({
				amount: String(this.SUBSCRIPTION_PRICE),

				currency: 'RUB',
				method,
				invoiceId: this.generateInvoiceId(),
				userId: user.id
			})
			.returning()

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
				const result = await this.paytureService.initPayment({
					type: 'Pay',
					orderId: payment.id,
					amount: this.SUBSCRIPTION_PRICE,
					total: this.SUBSCRIPTION_PRICE,
					product: 'Премиум-доступ на 30 дней',
					description: 'Оплата премиум-подписки на 1 месяц',
					url: 'https://teacoder.ru/payment/success',
					cheque: {
						Positions: [
							{
								Quantity: 1,
								Price: this.SUBSCRIPTION_PRICE,
								Tax: 2,
								Text: 'Премиум-доступ на 30 дней'
							}
						],
						CustomerContact: user.email
					}
				})

				providerResponse = this.paytureService.getPayUrl(
					result.SessionId
				)
				break
			case PaymentMethod.CRYPTO:
				providerResponse = await this.heleketService.createPayment({
					amount: String(this.SUBSCRIPTION_PRICE),
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
			await this.database.db
				.update(payments)
				.set({
					providerPaymentId:
						providerResponse?.id ?? providerResponse?.uuid,
					metadata: providerResponse
				})
				.where(eq(payments.id, payment.id))

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

	private getCountryCode(ip: string) {
		const geo = lookup(ip)

		return geo.country
	}

	private generateInvoiceId() {
		const digits = 8

		const min = Math.pow(10, digits - 1)
		const max = Math.pow(10, digits) - 1

		return Math.floor(Math.random() * (max - min + 1)) + min
	}
}
