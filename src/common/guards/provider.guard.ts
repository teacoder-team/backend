import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { Request } from 'express'

import { OAuthService } from '@/api/oauth/oauth.service'

@Injectable()
export class ProviderGuard implements CanActivate {
	public constructor(private readonly oauthService: OAuthService) {}

	public canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest() as Request

		const provider = request.params.provider

		const providerInstance = this.oauthService.findService(provider)

		if (!providerInstance) {
			throw new NotFoundException('Провайдер не найден')
		}

		return true
	}
}
