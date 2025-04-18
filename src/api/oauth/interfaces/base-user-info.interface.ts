export interface BaseUserInfo {
	id: string
	name: string
	email: string
	avatar: string
	accessToken?: string | null
	refreshToken?: string
	expiry?: number
	provider: string
}
