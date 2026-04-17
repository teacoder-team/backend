import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { AccountProvider } from '@prisma/generated'
import { SentinelService } from '@teacoder/sentinel'
import type { Request } from 'express'

@Injectable()
export class ProviderGuard implements CanActivate {
	public constructor(private readonly sentinelService: SentinelService) {}

	public canActivate(context: ExecutionContext) {
		const request = context.switchToHttp().getRequest<Request>()
		const provider = (
			request.params.provider as string
		).toUpperCase() as keyof typeof AccountProvider

		if (!(provider in AccountProvider))
			throw new NotFoundException('Провайдер не найден')

		const providerEnum = AccountProvider[provider]

		if (providerEnum !== AccountProvider.TELEGRAM) {
			const providerInstance = this.sentinelService.findService(
				providerEnum.toLowerCase()
			)

			if (!providerInstance) {
				throw new NotFoundException(
					'Провайдер не найден в SentinelService'
				)
			}
		}

		return true
	}
}
