import type { AllowedProvider } from './allowed-provider.interface'

export interface BaseProviderOptions {
	name: AllowedProvider
	authorizeUrl: string
	accessUrl: string
	profileUrl: string
	scopes: string[]
	clientId: string
	clientSecret: string
}
