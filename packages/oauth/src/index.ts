export {
	describeOAuthFailure,
	OAuthDeniedError,
	OAuthError,
	OAuthExchangeError,
	type OAuthExchangeFailure,
	OAuthProfileError
} from './errors'
export { type AuthorizationRequest, completeAuthorization, createAuthorization } from './flow'
export { discord } from './providers/discord'
export { github } from './providers/github'
export { google } from './providers/google'
export { telegram } from './providers/telegram'
export { vk } from './providers/vk'
export { yandex } from './providers/yandex'
export type { OAuthClientCredentials, OAuthProfile, OAuthProvider, OAuthTokens } from './types'
