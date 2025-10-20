import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import axios from 'axios'
import { createHash } from 'crypto'

import { HashAlgorithm } from './enums'
import { type RobokassaOptions, RobokassaOptionsSymbol } from './interfaces'
import type { CreatePaymentRequest } from './interfaces'

@Injectable()
export class RobokassaService {
	private readonly BASE_URL = 'https://auth.robokassa.ru'
	private readonly TRUSTED_IPS: string[]

	public constructor(
		@Inject(RobokassaOptionsSymbol)
		private readonly options: RobokassaOptions
	) {
		this.TRUSTED_IPS = ['185.59.216.65', '185.59.217.65']
	}

	public createPaymentUrl(data: CreatePaymentRequest) {
		const {
			login,
			password1,
			isTest,
			algorithm = HashAlgorithm.SHA512
		} = this.options

		const {
			outSum,
			invId,
			description,
			email,
			culture,
			shps = {},
			incCurrLabel,
			expirationDate,
			encoding = 'utf-8',
			resultUrl,
			successUrl,
			failUrl,
			isRecurring
		} = data

		let signatureBase = `${login}:${outSum}:${invId}:${password1}`

		const sortedShpKeys = Object.keys(shps).sort()

		sortedShpKeys.forEach(key => {
			const value = encodeURIComponent(shps[key])
			signatureBase += `:${key}=${value}`
		})

		const signature = createHash(algorithm)
			.update(signatureBase)
			.digest('hex')

		const url = new URL(`${this.BASE_URL}/Merchant/Index.aspx`)

		url.searchParams.set('MerchantLogin', login)
		url.searchParams.set('OutSum', outSum.toString())
		url.searchParams.set('Description', description)
		url.searchParams.set('SignatureValue', signature)
		url.searchParams.set('Encoding', encoding)

		if (invId) url.searchParams.set('InvId', invId.toString())
		if (email) url.searchParams.set('Email', email)
		if (culture) url.searchParams.set('Culture', culture)
		if (isTest) url.searchParams.set('IsTest', '1')
		if (incCurrLabel) url.searchParams.set('IncCurrLabel', incCurrLabel)
		if (expirationDate)
			url.searchParams.set('ExpirationDate', expirationDate)
		if (resultUrl) url.searchParams.set('URL', resultUrl)
		if (successUrl) url.searchParams.set('SuccessURL', successUrl)
		if (failUrl) url.searchParams.set('FailURL', failUrl)
		if (isRecurring) url.searchParams.set('Recurring', 'true')

		sortedShpKeys.forEach(key => {
			url.searchParams.set(key, shps[key])
		})

		return { url: url.toString() }
	}

	public async createRecurringPayment({
		outSum,
		description,
		invId,
		previousInvoiceId
	}: {
		outSum: number
		description: string
		invId: number
		previousInvoiceId: number
	}) {
		const {
			login,
			password1,
			algorithm = HashAlgorithm.SHA512
		} = this.options

		const signatureBase = `${login}:${outSum}:${invId}:${password1}`
		const signature = createHash(algorithm)
			.update(signatureBase)
			.digest('hex')

		const params = new URLSearchParams({
			MerchantLogin: login,
			OutSum: outSum.toString(),
			InvoiceID: invId.toString(),
			PreviousInvoiceID: previousInvoiceId.toString(),
			Description: description,
			SignatureValue: signature
		})

		const { data } = await axios.post(
			`${this.BASE_URL}/Merchant/Recurring`,
			params
		)

		if (!data.startsWith('OK'))
			throw new Error(`Recurring payment failed: ${data}`)

		return data
	}

	public verifyWebhook(ip: string, payload: any) {
		if (!this.TRUSTED_IPS.includes(ip))
			throw new BadRequestException('Invalid IP: ', ip)

		if (!this.isResultSignatureValid(payload))
			throw new BadRequestException('Invalid signature')

		return true
	}

	public isResultSignatureValid(payload: Record<string, any>): boolean {
		const outSum = payload.OutSum ?? payload.out_summ
		const invId = payload.InvId ?? payload.inv_id
		const signatureValue = payload.SignatureValue ?? payload.crc

		if (!outSum || !invId || !signatureValue) return false

		const shps = Object.fromEntries(
			Object.entries(payload)
				.filter(([k]) => k.startsWith('Shp_'))
				.sort(([a], [b]) => a.localeCompare(b))
		)

		const formattedSum =
			payload.IsTest === '1' ? String(outSum) : Number(outSum).toFixed(6)

		let base = `${formattedSum}:${invId}:${this.options.password2}`

		for (const [key, value] of Object.entries(shps)) {
			base += `:${key}=${encodeURIComponent(value)}`
		}

		const expectedHash = createHash(this.options.algorithm)
			.update(base)
			.digest('hex')
			.toUpperCase()

		return expectedHash === signatureValue.toUpperCase()
	}

	private createSignature({
		login,
		outSum,
		invId,
		password,
		algorithm
	}: {
		login: string
		outSum: number
		invId: number
		password: string
		algorithm: HashAlgorithm
	}): string {
		return createHash(algorithm)
			.update(`${login}:${outSum}:${invId}:${password}`)
			.digest('hex')
	}
}
