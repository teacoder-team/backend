import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import type { Request } from 'express'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'

@Injectable()
export class SessionAuthGuard implements CanActivate {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest() as Request

		const token = request.headers['x-session-token']

		if (!token) {
			throw new UnauthorizedException('Session token is missing')
		}

		const session = await this.redisService.hgetall(`sessions:${token}`)

		if (Object.keys(session).length === 0) {
			throw new UnauthorizedException('Session not found')
		}

		const user = await this.prismaService.user.findUnique({
			where: {
				id: session.userId
			}
		})

		if (!user) {
			throw new UnauthorizedException('User not found')
		}

		request.user = user

		return true
	}
}
