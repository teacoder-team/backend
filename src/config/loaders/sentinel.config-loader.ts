import { ConfigService } from '@nestjs/config'
import {
	GithubProvider,
	GoogleProvider,
	SentinelOptions
} from '@teacoder/sentinel'

import type { AllConfigs } from '../definitions'

export function getOAuthConfig(
	configService: ConfigService<AllConfigs>
): SentinelOptions {
	return {
		baseUrl: configService.get('hosts.rest', { infer: true }),
		services: [
			new GoogleProvider({
				clientId: configService.get('sentinel.google.clientId', {
					infer: true
				}),
				clientSecret: configService.get(
					'sentinel.google.clientSecret',
					{
						infer: true
					}
				),
				scopes: ['email', 'profile']
			}),
			new GithubProvider({
				clientId: configService.get('sentinel.github.clientId', {
					infer: true
				}),
				clientSecret: configService.get(
					'sentinel.github.clientSecret',
					{
						infer: true
					}
				),
				scopes: ['read:user', 'user:email']
			})
		]
	}
}
