import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Request } from 'express'
import { Repository } from 'typeorm'

import { Account } from '@/api/auth/account/entities'
import { RedisService } from '@/infra/redis/redis.service'

@Injectable()
export class SessionAuthGuard implements CanActivate {
	public constructor(
		private readonly redisService: RedisService,
		@InjectRepository(Account)
		private readonly accountRepository: Repository<Account>
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest() as Request

		const token = request.headers['x-session-token'] as string

		if (!token) {
			throw new UnauthorizedException('Session token is missing')
		}

		const keys = await this.redisService.keys('sessions:*')

		let foundSession = null

		for (const key of keys) {
			const session = await this.redisService.hgetall(key)

			if (session.token === token) {
				foundSession = session
				break
			}
		}

		if (!foundSession) {
			throw new UnauthorizedException('Invalid or expired session')
		}

		const user = await this.accountRepository.findOne({
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
