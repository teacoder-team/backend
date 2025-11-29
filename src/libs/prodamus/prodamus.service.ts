import { HttpService } from '@nestjs/axios'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { createHmac } from 'crypto'

import { Currency, PaymentDo } from './enums'
import { ProdamusOptions, ProdamusOptionsSymbol } from './interfaces'
import { CreatePaymentRequest } from './interfaces/create-payment-request.interface'

@Injectable()
export class ProdamusService {
	private readonly logger = new Logger(ProdamusService.name)

	private readonly BASE_URL: string
	private readonly SECRET_KEY: string

	public constructor(
		@Inject(ProdamusOptionsSymbol)
		private readonly options: ProdamusOptions,
		private readonly httpService: HttpService
	) {
		this.BASE_URL = 'https://demo.payform.ru'
		this.SECRET_KEY = this.options.secretKey
	}

	public async createPayment(data: CreatePaymentRequest) {
		if (!data.do) data.do = PaymentDo.PAY
		if (!data.currency) data.currency = Currency.RUB

		const flatData = this.flattenData(data)
		const signature = this.generateSignature(flatData)

		const url = this.buildUrl({
			...flatData,
			signature
		})

		this.logger.log(`✅ Prodamus payment link generated`)
		this.logger.debug(url)

		return { url }
	}

	private flattenData(
		data: Record<string, any>,
		parentKey = ''
	): Record<string, any> {
		const result: Record<string, any> = {}

		for (const [key, value] of Object.entries(data)) {
			const newKey = parentKey ? `${parentKey}[${key}]` : key

			if (Array.isArray(value)) {
				value.forEach((v, i) => {
					Object.assign(
						result,
						this.flattenData(v, `${newKey}[${i}]`)
					)
				})
			} else if (value !== null && typeof value === 'object') {
				Object.assign(result, this.flattenData(value, newKey))
			} else if (value !== undefined && value !== null) {
				result[newKey] = value
			}
		}

		return result
	}

	private generateSignature(flat: Record<string, any>): string {
		const sortedKeys = Object.keys(flat).sort()
		const signatureString = sortedKeys.map(key => flat[key]).join('')

		this.logger.debug(`Signature string: ${signatureString}`)

		return createHmac('sha256', this.SECRET_KEY)
			.update(signatureString)
			.digest('hex')
	}

	private buildUrl(payload: Record<string, any>): string {
		const params = new URLSearchParams()

		for (const [key, value] of Object.entries(payload)) {
			params.append(key, String(value))
		}

		return `${this.BASE_URL}/?${params.toString()}`
	}
}
