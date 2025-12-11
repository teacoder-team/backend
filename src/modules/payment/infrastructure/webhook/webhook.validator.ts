import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import CidrMatcher from 'cidr-matcher'
import { createHmac } from 'crypto'

import { IS_DEV_ENV } from '@/shared/utils'

@Injectable()
export class WebhookValidator {
	private readonly logger = new Logger(WebhookValidator.name)

	private readonly TRUSTED_YOOKASSA_IPS = new CidrMatcher([
		'185.71.76.0/27',
		'185.71.77.0/27',
		'77.75.153.0/25',
		'77.75.156.11/32',
		'77.75.156.35/32',
		'77.75.154.128/25',
		'2a02:5180::/32'
	])

	private readonly TRUSTED_HELEKET_IPS = ['31.133.220.8']

	public validateYooKassa(ip: string) {
		if (IS_DEV_ENV) {
			this.logger.debug(`Skipping YooKassa IP validation in dev mode`)
			return
		}

		if (!this.TRUSTED_YOOKASSA_IPS.contains(ip)) {
			this.logger.error(`❌ Invalid YooKassa IP: ${ip}`)
			throw new UnauthorizedException(`Invalid YooKassa IP: ${ip}`)
		}

		this.logger.log(`✅ YooKassa IP validated: ${ip}`)
	}

	public validateProdamus(body: any, signature: string, secretKey: string) {
		if (!signature) {
			this.logger.error(`❌ Missing Prodamus signature`)
			throw new UnauthorizedException('Missing Prodamus signature')
		}

		this.logger.debug(`Prodamus signature received: ${signature}`)

		const sortObject = (obj: any): any => {
			if (Array.isArray(obj)) return obj.map(sortObject)

			if (obj !== null && typeof obj === 'object')
				return Object.keys(obj)
					.sort()
					.reduce((acc, key) => {
						acc[key] = sortObject(obj[key])
						return acc
					}, {} as any)

			return obj
		}

		const sorted = sortObject(body)

		this.logger.debug(`Sorted payload: ${JSON.stringify(sorted)}`)

		let json = JSON.stringify(sorted)
		json = json.replace(/\//g, '\\/')

		this.logger.debug(`Normalized JSON for HMAC: ${json}`)

		const expected = createHmac('sha256', secretKey)
			.update(json)
			.digest('hex')

		this.logger.debug(`Generated HMAC: ${expected}`)

		if (expected !== signature) {
			this.logger.error(
				`❌ Invalid Prodamus signature. Expected=${expected}, Received=${signature}`
			)
			throw new UnauthorizedException('Invalid Prodamus signature')
		}

		this.logger.log(`✅ Prodamus signature verified successfully`)
	}

	public validateHeleket(ip: string) {
		if (IS_DEV_ENV) {
			this.logger.debug(`Skipping Heleket IP validation in dev mode`)
			return
		}

		if (!this.TRUSTED_HELEKET_IPS.includes(ip)) {
			this.logger.error(`❌ Invalid Heleket IP: ${ip}`)
			throw new UnauthorizedException(`Invalid Heleket IP: ${ip}`)
		}

		this.logger.log(`✅ Heleket IP validated: ${ip}`)
	}
}
