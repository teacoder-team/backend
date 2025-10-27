import { IsString } from 'class-validator'

export class FingerprintValidator {
	@IsString()
	public FINGERPRINT_API_KEY: string
}
