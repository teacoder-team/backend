import { Injectable, Logger } from '@nestjs/common'
import * as fs from 'fs'
import { ProxyAgent, request } from 'undici'

import { CreateIncomeResponse, NpdAuthResponse } from './types'

@Injectable()
export class NpdService {
	private readonly logger = new Logger(NpdService.name)

	private readonly API_URL: string

	private accessToken = process.env.NPD_ACCESS_TOKEN
	private refreshToken = process.env.NPD_REFRESH_TOKEN

	private readonly dispatcher?: ProxyAgent

	constructor() {
		this.API_URL = 'https://lknpd.nalog.ru/api/v1'

		if (process.env.PROXY_HOST && process.env.PROXY_PORT) {
			const proxyUrl = `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`

			this.dispatcher = new ProxyAgent(proxyUrl)

			this.logger.log(`NPD proxy enabled: ${proxyUrl}`)
		}
	}

	private async login() {
		this.logger.log('Logging in to NPD')

		const res = await request(`${this.API_URL}/auth/lkfl`, {
			method: 'POST',
			dispatcher: this.dispatcher,
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'okhttp/4.10.0'
			},
			body: JSON.stringify({
				username: process.env.NPD_INN,
				password: process.env.NPD_PASSWORD,
				deviceInfo: {
					sourceType: 'WEB',
					appVersion: '1.0.0'
				}
			})
		})

		if (res.statusCode >= 400) {
			const text = await res.body.text()
			throw new Error(`NPD auth failed: ${text}`)
		}

		const data = (await res.body.json()) as NpdAuthResponse

		this.accessToken = data.accessToken
		this.refreshToken = data.refreshToken

		this.persistTokens()
	}

	private async ensureAuth() {
		if (!this.accessToken) {
			await this.login()
		}
	}

	private persistTokens() {
		try {
			let env = fs.readFileSync('.env', 'utf8')

			env = env.replace(
				/NPD_ACCESS_TOKEN=.*/g,
				`NPD_ACCESS_TOKEN=${this.accessToken}`
			)
			env = env.replace(
				/NPD_REFRESH_TOKEN=.*/g,
				`NPD_REFRESH_TOKEN=${this.refreshToken}`
			)

			fs.writeFileSync('.env', env)
		} catch {
			this.logger.warn('Failed to persist NPD tokens')
		}
	}

	public async createIncome(params: {
		name: string
		amount: number
	}): Promise<CreateIncomeResponse> {
		await this.ensureAuth()

		const res = await request(`${this.API_URL}/income`, {
			method: 'POST',
			dispatcher: this.dispatcher,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				'Content-Type': 'application/json',
				'User-Agent': 'okhttp/4.10.0'
			},
			body: JSON.stringify({
				operationTime: new Date().toISOString(),
				requestTime: new Date().toISOString(),
				services: [
					{ name: params.name, amount: params.amount, quantity: 1 }
				],
				totalAmount: params.amount,
				paymentType: 'CASH',
				ignoreMaxTotalIncomeRestriction: false
			})
		})

		if (res.statusCode === 401) {
			this.logger.warn('NPD token expired, relogin')
			this.accessToken = undefined
			await this.login()
			return this.createIncome(params)
		}

		if (res.statusCode >= 400) {
			const text = await res.body.text()
			throw new Error(`NPD createIncome failed: ${text}`)
		}

		const data = (await res.body.json()) as CreateIncomeResponse

		this.logger.log(`NPD receipt created: ${data.receiptUuid}`)

		return data
	}

	public getReceiptPrintUrl(receiptId: string) {
		return `${this.API_URL}/receipt/${process.env.NPD_INN}/${receiptId}/print`
	}
}
