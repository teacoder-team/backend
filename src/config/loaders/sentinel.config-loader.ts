import { ConfigService } from '@nestjs/config'
import {
	DiscordProvider,
	GithubProvider,
	GitlabProfile,
	GitlabProvider,
	GoogleProvider,
	SentinelOptions,
	YandexProvider
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
			}),
			new DiscordProvider({
				clientId: configService.get('sentinel.discord.clientId', {
					infer: true
				}),
				clientSecret: configService.get(
					'sentinel.discord.clientSecret',
					{
						infer: true
					}
				),
				scopes: ['identify', 'email']
			}),
			new YandexProvider({
				clientId: configService.get('sentinel.yandex.clientId', {
					infer: true
				}),
				clientSecret: configService.get(
					'sentinel.yandex.clientSecret',
					{
						infer: true
					}
				),
				scopes: ['login:email', 'login:avatar', 'login:info']
			}),
			new GitlabProvider({
				clientId: configService.get('sentinel.gitlab.clientId', {
					infer: true
				}),
				clientSecret: configService.get(
					'sentinel.gitlab.clientSecret',
					{
						infer: true
					}
				),
				scopes: ['openid', 'profile', 'email', 'read_user']
			})
		]
	}
}
