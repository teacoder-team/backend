import { IsString } from 'class-validator'

export class HeleketValidator {
	@IsString()
	public HELEKET_MERCHANT_ID: string

	@IsString()
	public HELEKET_API_KEY: string
}
