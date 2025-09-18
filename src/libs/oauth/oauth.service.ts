import { Inject, Injectable, type OnModuleInit } from '@nestjs/common'

import { BaseService } from './base/base.service'
import { type OAuthOptions, OAuthOptionsSymbol } from './oauth.constants'

@Injectable()
export class OAuthService implements OnModuleInit {
	public constructor(
		@Inject(OAuthOptionsSymbol)
		private readonly options: OAuthOptions
	) {}

	public onModuleInit() {
		for (const provider of this.options.services) {
			provider.baseUrl = this.options.baseUrl
		}
	}

	public findService(service: string): BaseService | null {
		return this.options.services.find(s => s.name === service) ?? null
	}
}
