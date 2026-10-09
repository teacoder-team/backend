import type { HttpLogger } from '@teacoder/http'

export interface CaptchaResult {
	success: boolean

	errorCodes: string[]
}

export interface CaptchaVerifyOptions {

	remoteIp?: string
}

export interface CaptchaVerifier<Provider extends string = string> {
	readonly provider: Provider

	readonly siteKey: string

	verify(token: string, options?: CaptchaVerifyOptions): Promise<CaptchaResult>
}

export interface CaptchaCredentials {
	secretKey: string
	siteKey: string

	timeout?: number
	logger?: HttpLogger
}
