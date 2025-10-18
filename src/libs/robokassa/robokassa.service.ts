import { Inject, Injectable } from '@nestjs/common'
import { createHash } from 'crypto'

import { HashAlgorithm } from './enums'
import { type RobokassaOptions, RobokassaOptionsSymbol } from './interfaces'
import type { CreatePaymentRequest } from './interfaces'

@Injectable()
export class RobokassaService {
	private readonly BASE_URL = 'https://auth.robokassa.ru/Merchant/Index.aspx'

	public constructor(
		@Inject(RobokassaOptionsSymbol)
		private readonly options: RobokassaOptions
	) {}

	public createPaymentUrl(data: CreatePaymentRequest) {
		const {
			login,
			password1,
			isTest,
			algorithm = HashAlgorithm.SHA512
		} = this.options

		const { outSum, invId, description, email, culture } = data

		const signature = this.createSignature({
			login,
			outSum,
			invId,
			password: password1,
			algorithm
		})

		const url = new URL(this.BASE_URL)

		url.searchParams.set('MerchantLogin', login)
		url.searchParams.set('OutSum', outSum.toString())
		url.searchParams.set('InvId', invId.toString())
		url.searchParams.set('Description', description)
		url.searchParams.set('SignatureValue', signature)

		if (email) url.searchParams.set('Email', email)
		if (culture) url.searchParams.set('Culture', culture)
		if (isTest) url.searchParams.set('IsTest', '1')

		return { url: url.toString() }
	}

	public isResultSignatureValid(
		signature: string,
		outSum: number,
		invId: string
	): boolean {
		const { login, password2, algorithm } = this.options

		const expected = this.createSignature({
			login,
			outSum,
			invId,
			password: password2,
			algorithm
		})

		return expected.toLowerCase() === signature.toLowerCase()
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
		invId: string
		password: string
		algorithm: HashAlgorithm
	}): string {
		return createHash(algorithm)
			.update(`${login}:${outSum}:${invId}:${password}`)
			.digest('hex')
	}
}
