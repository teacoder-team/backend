import { IsString } from 'class-validator'

export class TurnstileValidator {
	@IsString()
	public CAPTCHA_SECRET_KEY: string
}
