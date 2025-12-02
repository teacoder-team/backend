import { HttpService } from '@nestjs/axios'
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { catchError, firstValueFrom, map, tap, timeout } from 'rxjs'
import { URLSearchParams } from 'url'

import { PAYTURE_OPTIONS } from './constants'
import type {
	PaytureInitPaymentRequest,
	PaytureInitPaymentResponse,
	PaytureOptions
} from './interfaces'

@Injectable()
export class PaytureService {
	private readonly logger = new Logger(PaytureService.name)

	private readonly BASE_URL: string

	public constructor(
		@Inject(PAYTURE_OPTIONS) private readonly options: PaytureOptions,
		private readonly httpService: HttpService
	) {
		this.BASE_URL = `https://${this.options.environment ?? 'sandbox3'}.payture.com/apim`
	}

	public async initPayment(
		params: PaytureInitPaymentRequest
	): Promise<PaytureInitPaymentResponse> {
		const mapped = this.mapParamsToInitFormat(params)
		const dataString = this.buildDataString(mapped)

		const body = new URLSearchParams()
		body.set('Key', this.options.key)
		body.set('Data', dataString)

		const url = `${this.BASE_URL}/Init`

		this.logger.log(`➡️ Init Payment: orderId=${params.orderId}`)

		const xml = await this.request(url, body, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		})

		const parsed: Record<string, string> = {}
		const regex = /(\w+)="([^"]*)"/g

		let match: RegExpExecArray | null
		while ((match = regex.exec(xml))) parsed[match[1]] = match[2]

		this.logger.debug(
			`📄 Payture parsed response: ${JSON.stringify(parsed)}`
		)

		if (!parsed.Success)
			throw new BadRequestException(
				'[Payture] Invalid XML structure: no Success field'
			)

		if (parsed.Success === 'False') {
			const err = parsed.ErrCode || 'Unknown error'
			this.logger.error(`❌ Payture Init failed: ${err}`)

			return {
				Success: 'False',
				ErrCode: parsed.ErrCode
			}
		}

		const response: PaytureInitPaymentResponse = {
			Success: 'True',
			OrderId: parsed.OrderId,
			Amount: parsed.Amount,
			SessionId: parsed.SessionId,
			SessionLifeTime: parsed.SessionLifeTime,
			AttemptsCount: parsed.AttemptsCount
		}

		this.logger.log(
			`✅ Payment Initialized: SessionId=${response.SessionId}`
		)

		return response
	}

	public getPayUrl(sessionId: string) {
		return { url: `${this.BASE_URL}/Pay?SessionId=${sessionId}` }
	}

	private mapParamsToInitFormat(params: PaytureInitPaymentRequest) {
		const chequeBase64 = params.cheque
			? Buffer.from(JSON.stringify(params.cheque)).toString('base64')
			: undefined

		const mapped: Record<string, any> = {
			SessionType: params.type,
			OrderId: params.orderId,
			Amount: Math.round(params.amount * 100),
			Total: params.total ? params.total.toString() : undefined,
			Url: params.url,
			Product: params.product,
			Phone: params.phone,
			Description: params.description,
			IP: params.ip,
			Cheque: chequeBase64,
			...(params.additional ?? {})
		}

		return mapped
	}

	private buildDataString(params: Record<string, any>) {
		const parts = Object.entries(params)
			.filter(([, v]) => v !== undefined && v !== null)
			.map(([key, value]) => `${key}=${value}`)

		return encodeURIComponent(parts.join(';') + ';')
	}

	private parseXmlResponse(xml: string): Record<string, string> {
		const parsed: Record<string, string> = {}
		const regex = /(\w+)="([^"]*)"/g

		let match: RegExpExecArray | null
		while ((match = regex.exec(xml))) parsed[match[1]] = match[2]

		this.logger.debug(
			`📄 Payture parsed response: ${JSON.stringify(parsed)}`
		)

		return parsed
	}

	private async request(
		url: string,
		data: any,
		config: any
	): Promise<string> {
		const request$ = this.httpService.post(url, data, config).pipe(
			timeout(10_000),
			tap(res => {
				this.logger.debug(`⬅️ Payture Response status=${res.status}`)
			}),
			map(res => res.data),
			catchError(err => {
				this.logger.error(`❌ HTTP Error: ${err.message}`)

				throw new BadRequestException(
					`Payture HTTP Error: ${err.message || err}`
				)
			})
		)

		return firstValueFrom(request$)
	}
}
