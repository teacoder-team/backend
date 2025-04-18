import { Injectable } from '@nestjs/common'

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

	public async extractUserInfo(data: GithubProfile): Promise<BaseUserInfo> {
		console.log(data)

		return super.extractUserInfo({
			id: data.id.toString(),
			name: data.name,
			email: data.email,
			avatar: data.avatar_url
		})
	}
}
