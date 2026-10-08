import type { HttpLogger } from '@teacoder/http'

export interface CaptchaResult {
	success: boolean
	/** Provider's reasons for a failure, e.g. "timeout-or-duplicate". Empty on success. */
	errorCodes: string[]
}

export interface CaptchaVerifyOptions {
	/** The visitor's IP - optional, but both providers score better with it. */
	remoteIp?: string
}

export interface CaptchaVerifier<Provider extends string = string> {
	readonly provider: Provider
	/** Public key the client-side widget renders with. Safe to expose. */
	readonly siteKey: string
	/** Rejects only when the provider could not be reached - a bad token resolves with success: false. */
	verify(token: string, options?: CaptchaVerifyOptions): Promise<CaptchaResult>
}

export interface CaptchaCredentials {
	secretKey: string
	siteKey: string
	/** Milliseconds. Default 7000. */
	timeout?: number
	logger?: HttpLogger
}
