import { IsString } from 'class-validator'

export class PaytureValidator {
	@IsString()
	public PAYTURE_ENVIRONMENT: string

	@IsString()
	public PAYTURE_API_KEY: string
}
