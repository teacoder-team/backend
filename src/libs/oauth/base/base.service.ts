import { BadRequestException, Injectable } from '@nestjs/common'

import type { BaseProviderOptions, BaseUserInfo } from '../interfaces'

@Injectable()
export class BaseService {
	private _baseUrl: string

	public constructor(private readonly options: BaseProviderOptions) {}

	protected async extractUserInfo(
		data: any,
		accessToken?: string
	): Promise<BaseUserInfo> {
		return {
			...data,
			provider: this.options.name
		}
	}

	public getAuthUrl(state?: string) {
		const query = new URLSearchParams({
			response_type: 'code',
			client_id: this.options.clientId,
			redirect_uri: this.getRedirectUrl(),
			scope: (this.options.scopes ?? []).join(' '),
			access_type: 'offline',
			prompt: 'select_account',
			state: state ?? ''
		})

		return `${this.options.authorizeUrl}?${query}`
	}

	public async getUserByCode(code: string): Promise<BaseUserInfo> {
		const clientId = this.options.clientId
		const clientSecret = this.options.clientSecret

		const tokensQuery = new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			code,
			redirect_uri: this.getRedirectUrl(),
			grant_type: 'authorization_code'
		})

		const tokensRequest = await fetch(this.options.accessUrl, {
			method: 'POST',
			body: tokensQuery,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				Accept: 'application/json'
			}
		})

		if (!tokensRequest.ok) {
			throw new BadRequestException(
				`Failed to fetch tokens from ${this.options.accessUrl}`
			)
		}

		const tokens = await tokensRequest.json()

		if (!tokens.access_token) {
			throw new BadRequestException(`No tokens ${this.options.accessUrl}`)
		}

		const userRequest = await fetch(this.options.profileUrl, {
			headers: {
				Authorization: `Bearer ${tokens.access_token}`
			}
		})

		if (!userRequest.ok) {
			throw new BadRequestException(
				`Failed to fetch user from ${this.options.profileUrl}`
			)
		}

		const user = await userRequest.json()

		const userData = await this.extractUserInfo(user, tokens.access_token)

		return {
			...userData,
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			expiry: tokens.expiresAt || tokens.expires_in,
			provider: this.options.name
		}
	}

	public getRedirectUrl() {
		return `${this._baseUrl}/auth/sso/callback/${this.options.name}`
	}

	public set baseUrl(value: string) {
		this._baseUrl = value
	}

	public get name() {
		return this.options.name
	}

	public get accessUrl() {
		return this.options.accessUrl
	}

	public get profileUrl() {
		return this.options.profileUrl
	}

	public get scopes() {
		return this.options.scopes
	}
}
