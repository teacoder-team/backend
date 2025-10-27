import { HttpService } from '@nestjs/axios'
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'

import { type FingerprintOptions, FingerprintOptionsSymbol } from './interfaces'

@Injectable()
export class FingerprintService {
	private readonly logger = new Logger(FingerprintService.name)

	private readonly API_URL: string

	public constructor(
		@Inject(FingerprintOptionsSymbol)
		private readonly options: FingerprintOptions,
		private readonly httpService: HttpService
	) {
		this.API_URL = 'https://api.fpjs.io/'
	}

	public async getVisitorData(visitorId: string, requestId?: string) {
		const url = `${this.API_URL}/v1/visitors/${visitorId}`

		const params: Record<string, string> = {
			api_key: this.options.apiKey
		}

		if (requestId) params.request_id = requestId

		try {
			const { data } = await firstValueFrom(
				this.httpService.get(url, { params })
			)

			this.logger.debug(`Fingerprint response: ${JSON.stringify(data)}`)

			return data
		} catch (error) {
			this.logger.error(`❌ Fingerprint API error: ${error.message}`)
			throw new BadRequestException('Failed to fetch visitor data')
		}
	}
}
