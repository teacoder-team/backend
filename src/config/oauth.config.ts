import { ConfigService } from '@nestjs/config'

import type { OAuthOptions } from '@/api/oauth/oauth.constants'
import { GithubProvider, GoogleProvider } from '@/api/oauth/providers'

export function getOAuthConfig(configService: ConfigService): OAuthOptions {
	return {
		baseUrl: configService.getOrThrow<string>('APPLICATION_URL'),
		services: [
			new GoogleProvider({
				clientId: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
				clientSecret: configService.getOrThrow<string>(
					'GOOGLE_CLIENT_SECRET'
				),
				scopes: ['email', 'profile']
			}),
			new GithubProvider({
				clientId: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
				clientSecret: configService.getOrThrow<string>(
					'GITHUB_CLIENT_SECRET'
				),
				scopes: ['read:user', 'user:email']
			})
		]
	}
}
