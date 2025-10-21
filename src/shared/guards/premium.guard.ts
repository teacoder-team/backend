import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable
} from '@nestjs/common'
import { Request } from 'express'

import { PrismaService } from '@/infra/prisma/prisma.service'

@Injectable()
export class PremiumGuard implements CanActivate {
	public constructor(private readonly prismaService: PrismaService) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>()
		const user = request.user

		const subscription = await this.prismaService.subscription.findUnique({
			where: {
				userId: user.id
			}
		})

		const now = new Date()

		const valid =
			subscription &&
			subscription.isActive &&
			(!subscription.expiresAt || subscription.expiresAt > now)

		if (!valid)
			throw new ForbiddenException('Premium subscription required')

		return true
	}
}
