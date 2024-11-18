import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { Request } from 'express'

import { PrismaService } from '@/core/prisma/prisma.service'

@Injectable()
export class SessionGuard implements CanActivate {
	public constructor(private readonly prismaService: PrismaService) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest() as Request

		if (!request.isAuthenticated()) {
			throw new UnauthorizedException(
				'Для выполнения данного действия необходима авторизация'
			)
		}

		return true
	}
}
