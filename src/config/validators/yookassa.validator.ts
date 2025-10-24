import { IsString } from 'class-validator'

export class YookassaValidator {
	@IsString()
	public YOOKASSA_SHOP_ID: string

	@IsString()
	public YOOKASSA_API_KEY: string
}
