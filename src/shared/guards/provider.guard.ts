import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { SentinelService } from '@teacoder/sentinel'
import type { Request } from 'express'

@Injectable()
export class ProviderGuard implements CanActivate {
	public constructor(private readonly sentinelService: SentinelService) {}

	public canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest<Request>()

		const provider = request.params.provider

		const providerInstance = this.sentinelService.findService(provider)

		if (!providerInstance)
			throw new NotFoundException('Провайдер не найден')

		return true
	}
}
