import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { execSync } from 'child_process'
import { lookup } from 'geoip-lite'

import { AllConfigs } from '@/config/definitions'

@Injectable()
export class CoreService {
	private readonly PROXY_IP: string

	private readonly TURNSTILE_PUBLIC_KEY: string
	private readonly YANDEX_PUBLIC_KEY: string

	public constructor(private readonly configService: ConfigService) {
		this.PROXY_IP = this.configService.get('PROXY_HOST')

		this.TURNSTILE_PUBLIC_KEY = this.configService.get('')
		// this.YANDEX_PUBLIC_KEY = 'yandex-smart-captcha-token'
	}

	private getCountry(ip: string) {
		const geo = lookup(ip)

		return {
			ip,
			country: geo?.country ?? 'XX'
		}
	}

	private getCaptcha(country: string) {
		// if (country === 'RU') {
		// 	return {
		// 		provider: 'yandex',
		// 		key: this.YANDEX_PUBLIC_KEY
		// 	}
		// }

		return {
			provider: 'cloudflare',
			key: this.TURNSTILE_PUBLIC_KEY
		}
	}

	public async getConfig(ip: string) {
		const geo = this.getCountry(ip)

		return {
			server: {
				env: 'development',
				version: '1.0.0',
				timestamp: Date.now()
			},
			proxy: {
				ip: this.PROXY_IP,
				provider: 'Beget'
			},
			geo,
			captcha: this.getCaptcha(geo.country),
			git: this.getGitInfo()
		}
	}

	private getGitInfo() {
		try {
			const commit = execSync('git rev-parse HEAD').toString().trim()
			const date = execSync('git log -1 --format=%cd --date=iso')
				.toString()
				.trim()
			const message = execSync('git log -1 --pretty=%B').toString().trim()

			return {
				commit,
				date,
				message
			}
		} catch {
			return {
				commit: null,
				date: null,
				message: null
			}
		}
	}
}
