import { Injectable } from '@nestjs/common'

import { BaseService } from '../base/base.service'
import {
	AllowedProvider,
	type BaseUserInfo,
	type GoogleProfile,
	type ProviderOptions
} from '../interfaces'

@Injectable()
export class GoogleProvider extends BaseService {
	public constructor(options: ProviderOptions) {
		super({
			name: AllowedProvider.GOOGLE,
			authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
			accessUrl: 'https://oauth2.googleapis.com/token',
			profileUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
			scopes: options.scopes,
			clientId: options.clientId,
			clientSecret: options.clientSecret
		})
	}

	public async extractUserInfo(data: GoogleProfile): Promise<BaseUserInfo> {
		console.log('GOOGLE: ', data)
		return super.extractUserInfo({
			id: data.sub,
			name: data.name,
			email: data.email,
			avatar: data.picture
		})
	}
}
