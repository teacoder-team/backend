import { HttpService } from '@nestjs/axios'
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { createHash, timingSafeEqual } from 'crypto'
import { firstValueFrom } from 'rxjs'

import { HeleketPaymentWebhookResponse } from '@/api/payment/webhook/dto'
import { type HeleketOptions, HeleketOptionsSymbol } from '@/shared/interfaces'

import type {
	ApiResponse,
	CreatePaymentRequest,
	CreatePaymentResponse
} from './interfaces'

@Injectable()
export class HeleketService {
	private readonly logger = new Logger(HeleketService.name)

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

	public verifyWebhook(ip: string, payload: HeleketPaymentWebhookResponse) {
		this.logger.debug(`Incoming Heleket webhook from IP: ${ip}`)
		this.logger.debug(`Payload: ${JSON.stringify(payload, null, 2)}`)

		if (!this.TRUSTED_IPS.includes(ip)) {
			this.logger.error(`❌ Invalid IP: ${ip}`)
			throw new BadRequestException(`Invalid IP: ${ip}`)
		}

		const { sign } = payload
		this.logger.debug(`Received sign: ${sign}`)

		const dataCopy = { ...payload }
		delete dataCopy.sign

		this.logger.debug(
			`Payload without sign: ${JSON.stringify(dataCopy, null, 2)}`
		)

		const jsonData = JSON.stringify(dataCopy).replace(/\//g, '\\/')
		this.logger.debug(`jsonData (after replace): ${jsonData}`)

		const base64Data = Buffer.from(jsonData, 'utf8').toString('base64')
		this.logger.debug(`base64Data: ${base64Data}`)

		const rawString = base64Data + this.options.apiKey
		this.logger.debug(`rawString for hash: ${rawString}`)

		const hash = createHash('md5').update(rawString, 'utf8').digest('hex')

		this.logger.debug(`Calculated hash: ${hash}`)
		this.logger.debug(`Received sign (lowercase): ${sign?.toLowerCase()}`)

		try {
			if (
				!timingSafeEqual(
					Buffer.from(hash.toLowerCase(), 'utf8'),
					Buffer.from(sign.toLowerCase(), 'utf8')
				)
			) {
				this.logger.error('❌ Invalid signature detected')
				throw new BadRequestException('Invalid signature')
			}
		} catch (err) {
			this.logger.error(`❌ Signature comparison failed: ${err.message}`)
			throw new BadRequestException('Invalid signature')
		}

		this.logger.log('✅ Heleket webhook verified successfully')
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
