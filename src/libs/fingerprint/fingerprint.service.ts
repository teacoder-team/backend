import {
	FingerprintJsServerApiClient,
	Region
} from '@fingerprintjs/fingerprintjs-pro-server-api'
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common'

import { type FingerprintOptions, FingerprintOptionsSymbol } from './interfaces'

@Injectable()
export class FingerprintService {
	private readonly logger = new Logger(FingerprintService.name)

	private readonly client: FingerprintJsServerApiClient

	public constructor(
		@Inject(FingerprintOptionsSymbol)
		private readonly options: FingerprintOptions
	) {
		this.client = new FingerprintJsServerApiClient({
			apiKey: options.apiKey,
			region: options.region ?? Region.Global
		})
	}

	public async getEvent(requestId: string) {
		this.logger.debug(`Fetching event ${requestId} from Fingerprint`)

		try {
			const event = await this.client.getEvent(requestId)

			this.logger.debug(`Event ${requestId} fetched successfully`)

			return event
		} catch (error) {
			this.logger.error(
				`❌ Failed to get event ${requestId}: ${error.message}`
			)
			throw new BadRequestException('Failed to fetch fingerprint event')
		}
	}

	public async getVisitorHistory(visitorId: string) {
		this.logger.debug(`Fetching visitor ${visitorId} history`)

		try {
			const history = await this.client.getVisits(visitorId, {
				limit: 10
			})

			this.logger.debug(`History for ${visitorId} fetched successfully`)

			return history
		} catch (error) {
			this.logger.error(
				`❌ Failed to fetch visitor ${visitorId}: ${error.message}`
			)
			throw new BadRequestException('Failed to fetch visitor data')
		}
	}
}
