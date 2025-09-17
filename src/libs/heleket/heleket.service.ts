import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import { createHash } from 'crypto'
import { firstValueFrom } from 'rxjs'

import { type HeleketOptions, HeleketOptionsSymbol } from '@/common/interfaces'

import type {
	ApiResponse,
	CreatePaymentRequest,
	CreatePaymentResponse
} from './interfaces'

@Injectable()
export class HeleketService {
	private readonly API_URL: string

	public constructor(
		@Inject(HeleketOptionsSymbol)
		private readonly options: HeleketOptions,
		private readonly httpService: HttpService
	) {
		this.API_URL = 'https://api.heleket.com/v1'
	}

	public async createPayment(data: CreatePaymentRequest) {
		const response = await this.request<CreatePaymentResponse>(
			'/payment',
			data
		)

		return response.result
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
