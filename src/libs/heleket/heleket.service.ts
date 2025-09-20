import { HttpService } from '@nestjs/axios'
import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { createHash, timingSafeEqual } from 'crypto'
import { firstValueFrom } from 'rxjs'

import { type HeleketOptions, HeleketOptionsSymbol } from '@/common/interfaces'

import type {
	ApiResponse,
	CreatePaymentRequest,
	CreatePaymentResponse,
	HeleketPaymentWebhook
} from './interfaces'

@Injectable()
export class HeleketService {
	private readonly API_URL: string
	private readonly TRUSTED_IPS: string[]

	public constructor(
		@Inject(HeleketOptionsSymbol)
		private readonly options: HeleketOptions,
		private readonly httpService: HttpService
	) {
		this.API_URL = 'https://api.heleket.com/v1'
		this.TRUSTED_IPS = ['31.133.220.8']
	}

	public async createPayment(data: CreatePaymentRequest) {
		const response = await this.request<CreatePaymentResponse>(
			'/payment',
			data
		)

		return response.result
	}

	public verifyWebhook(ip: string, payload: HeleketPaymentWebhook) {
		if (!this.TRUSTED_IPS.includes(ip))
			throw new BadRequestException('Invalid IP')

		const { sign } = payload
		const dataCopy = { ...payload }
		delete dataCopy.sign

		const jsonData = JSON.stringify(dataCopy).replace(/\//g, '\\/')

		const base64Data = Buffer.from(jsonData, 'utf8').toString('base64')

		const hash = createHash('md5')
			.update(base64Data + this.options.apiKey, 'utf8')
			.digest('hex')

		if (
			!timingSafeEqual(
				Buffer.from(hash.toLowerCase(), 'utf8'),
				Buffer.from(sign.toLowerCase(), 'utf8')
			)
		)
			throw new BadRequestException('Invalid signature')
	}

	private async request<T = any>(
		path: string,
		body: any = {}
	): Promise<ApiResponse<T>> {
		const base64Body = Buffer.from(JSON.stringify(body)).toString('base64')
		const sign = createHash('md5')
			.update(base64Body + this.options.apiKey)
			.digest('hex')

		const url = `${this.API_URL}${path}`

		const { data } = await firstValueFrom(
			this.httpService.post<ApiResponse<T>>(url, body, {
				headers: {
					'Content-Type': 'application/json',
					merchant: this.options.merchant,
					sign
				}
			})
		)

		return data
	}
}
