import { HttpService } from '@nestjs/axios'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { createHmac } from 'crypto'

import { Currency, PaymentDo } from './enums'
import { ProdamusOptions, ProdamusOptionsSymbol } from './interfaces'
import type { CreatePaymentRequest } from './interfaces/create-payment-request.interface'

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
		this.BASE_URL = 'https://teacoder.payform.ru'
		this.SECRET_KEY = this.options.secretKey
	}

	public async createPayment(data: CreatePaymentRequest) {
		const payload: CreatePaymentRequest = {
			...data,
			do: data.do ?? PaymentDo.PAY,
			currency: (data.currency ?? Currency.RUB).toLowerCase() as Currency
		}

		const signature = this.generateSignature(payload)

		const payloadWithSignature: Record<string, any> = {
			...payload,
			signature
		}

		const flat = this.flattenData(payloadWithSignature)

		const params = new URLSearchParams()
		for (const [key, value] of Object.entries(flat)) {
			params.append(key, String(value))
		}

		const url = `${this.BASE_URL}/?${params.toString()}`

		this.logger.log(`✅ Prodamus payment link generated`)
		this.logger.debug(url)

		return { url }
	}

	private generateSignature(data: Record<string, any>): string {
		const copy: Record<string, any> = { ...data }
		delete copy.signature

		const normalized = this.normalizeAndSort(copy)

		let json = JSON.stringify(normalized)

		json = json.replace(/\//g, '\\/')

		this.logger.debug(`Prodamus signature payload JSON: ${json}`)

		return createHmac('sha256', this.SECRET_KEY).update(json).digest('hex')
	}

	private normalizeAndSort(value: any): any {
		if (Array.isArray(value)) {
			return value.map(v => this.normalizeAndSort(v))
		}

		if (value !== null && typeof value === 'object') {
			const sortedKeys = Object.keys(value).sort()
			const result: Record<string, any> = {}

			for (const key of sortedKeys) {
				const v = value[key]
				if (v === undefined || v === null) continue

				result[key] = this.normalizeAndSort(v)
			}

			return result
		}

		if (value === null || value === undefined) return ''
		return String(value)
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
}
