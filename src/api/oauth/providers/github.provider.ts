import { BadRequestException, Injectable } from '@nestjs/common'

import { BaseService } from '../base/base.service'
import {
	AllowedProvider,
	type BaseUserInfo,
	type GithubProfile,
	type ProviderOptions
} from '../interfaces'

@Injectable()
export class GithubProvider extends BaseService {
	public constructor(options: ProviderOptions) {
		super({
			name: AllowedProvider.GITHUB,
			authorizeUrl: 'https://github.com/login/oauth/authorize',
			accessUrl: 'https://github.com/login/oauth/access_token',
			profileUrl: 'https://api.github.com/user',
			scopes: options.scopes,
			clientId: options.clientId,
			clientSecret: options.clientSecret
		})
	}

	public override async extractUserInfo(
		data: GithubProfile,
		accessToken?: string
	): Promise<BaseUserInfo> {
		let email = ''

		if (accessToken) {
			const response = await fetch('https://api.github.com/user/emails', {
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: 'application/json'
				}
			})

			if (!response.ok) {
				throw new BadRequestException('Failed to fetch GitHub emails')
			}

			const emails = await response.json()

			email =
				emails.find((e: any) => e.primary && e.verified)?.email ?? ''
		}

		return super.extractUserInfo({
			id: data.id.toString(),
			name: data.name || data.login,
			email,
			avatar: data.avatar_url
		})
	}
}
