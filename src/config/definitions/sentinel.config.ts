export interface SentinelProviderConfig {
	clientId: string
	clientSecret: string
}

export interface SentinelConfig {
	restHost: string
	google: SentinelProviderConfig
	github: SentinelProviderConfig
	discord: SentinelProviderConfig
}
