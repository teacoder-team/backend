import { Inject, Injectable } from '@nestjs/common'
import { createHash } from 'crypto'

import {
	type RobokassaOptions,
	RobokassaOptionsSymbol
} from '@/common/interfaces'

import type { CreatePaymentRequest } from './interfaces'

@Injectable()
export class RobokassaService {
	private readonly BASE_URL: string

	public constructor(
		@Inject(RobokassaOptionsSymbol)
		private readonly options: RobokassaOptions
	) {
		this.BASE_URL = 'https://auth.robokassa.ru/Merchant/Index.aspx'
	}

	public createPaymentUrl(data: CreatePaymentRequest) {
		const { login, password } = this.options

		console.log('ROBOKASSA PAYMENT: ', data)

		const { outSum, invId, description, email, culture } = data

		const signature = createHash('sha512')
			.update(`${login}:${outSum}:${invId}:${password}`)
			.digest('hex')

		const url = new URL(this.BASE_URL)

		url.searchParams.set('MerchantLogin', login)
		url.searchParams.set('OutSum', outSum.toString())
		url.searchParams.set('InvId', invId.toString())
		url.searchParams.set('Description', description)
		url.searchParams.set('SignatureValue', signature)

		if (email) url.searchParams.set('Email', email)
		if (culture) url.searchParams.set('Culture', culture)

		return { url: url.toString() }
	}
}
