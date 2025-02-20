import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { verify } from 'argon2'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'

import { LoginRequest } from './dto'

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService
	) {}

	public async login(dto: LoginRequest, ip: string, userAgent: string) {
		const { email, password } = dto

		const user = await this.prismaService.user.findFirst({
			where: {
				email
			}
		})

		if (!user) {
			throw new NotFoundException('Пользователь не найден')
		}

		if (!user.password) {
			throw new BadRequestException(
				'Вход через пароль недоступен, т.к. вы зарегистрированы через соц. сеть'
			)
		}

		const isValidPassword = await verify(user.password, password)

		if (!isValidPassword) {
			throw new UnauthorizedException('Неправильный пароль')
		}

		const session = await this.redisService.createSession(
			user,
			ip,
			userAgent
		)

		return session
	}

	public async logout(token: string) {
		const session = await this.redisService.hgetall(`sessions:${token}`)

		if (!session || session.token !== token)
			throw new UnauthorizedException('Session not found')

		await this.redisService.del(`sessions:${token}`)
		await this.redisService.del(`user_sessions:${session.token}`)

		return true
	}
}
