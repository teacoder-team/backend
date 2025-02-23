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

		const token = request.headers['x-session-token'] as string

		if (!token) throw new UnauthorizedException('Unauthorized')

		const keys = await this.redisService.keys('sessions:*')

		const foundSession = await Promise.all(
			keys.map(async key => {
				const session = await this.redisService.hgetall(key)

				return session.token === token ? session : null
			})
		).then(sessions => sessions.find(Boolean))

		if (!foundSession) throw new UnauthorizedException('Session not found')

		const user = await this.prismaService.user.findUnique({
			where: {
				id: foundSession.userId
			}
		})

		if (!user) {
			throw new UnauthorizedException('User not found')
		}

		request.user = user

		return true
	}
}
