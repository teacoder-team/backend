import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { TotpStatus, User } from '@prisma/generated'
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

		const isValidPassword = await verify(user.password, password)

		if (!isValidPassword) {
			throw new UnauthorizedException('Неверный логин или пароль')
		}

		const mfa =
			await this.prismaService.multiFactorAuthentication.findUnique({
				where: {
					userId: user.id
				},
				include: {
					totp: true
				}
			})

		if (mfa && mfa.recoveryCodes.length > 0) {
			const allowedMethods: string[] = []

			if (mfa.totp?.status === TotpStatus.ENABLED)
				allowedMethods.push('Totp')
			if (mfa.recoveryCodes.length > 0) allowedMethods.push('Recovery')

			const ticket = await this.redisService.createMfaTicket(
				user.id,
				allowedMethods
			)

			return ticket
		}

		const session = await this.redisService.createSession(
			user,
			ip,
			userAgent
		)

		return session
	}

	public async logout(token: string) {
		const keys = await this.redisService.keys('sessions:*')

		const currentSession = await Promise.all(
			keys.map(async key => {
				const session = await this.redisService.hgetall(key)

				return session.token === token ? session : null
			})
		).then(sessions => sessions.find(Boolean))

		if (!currentSession) throw new NotFoundException('Session not found')

		await this.redisService.del(`sessions:${currentSession.id}`)
		await this.redisService.del(`user_sessions:${currentSession.id}`)

		return true
	}

	public async getSessions(user: User, token: string) {
		const keys = await this.redisService.keys('sessions:*')

		let currentSession = null

		const promises = keys.map(async key => {
			const session = await this.redisService.hgetall(key)

			if (session.token === token) {
				currentSession = await this.getSessionDetails(session)

				return null
			}

			if (session.userId === user.id) {
				const sessionDetails = await this.getSessionDetails(session)

				return sessionDetails
			}

			return null
		})

		const userSessions = (await Promise.all(promises)).filter(Boolean)

		if (currentSession) {
			return [currentSession, ...userSessions]
		}

		return userSessions
	}

	public async revoke(id: string, token: string) {
		const session = await this.redisService.hgetall(`sessions:${id}`)

		if (!session) throw new UnauthorizedException('Session not found')

		await this.redisService.del(`sessions:${session.id}`)
		await this.redisService.del(`user_sessions:${session.id}`)

		return true
	}

	public async removeAll(user: User, token: string) {
		const keys = await this.redisService.keys('sessions:*')

		const sessions = []
		const userSessions = []

		const promises = keys.map(async key => {
			const session = await this.redisService.hgetall(key)

			if (session.userId === user.id && session.token !== token) {
				sessions.push(key)
				userSessions.push(`user_sessions:${session.id}`)
			}

			return null
		})

		await Promise.all(promises)

		if (sessions.length > 0) {
			await Promise.all([
				...sessions.map(key => this.redisService.del(key)),
				...userSessions.map(key => this.redisService.del(key))
			])
		}

		return true
	}

	@Cron(CronExpression.EVERY_6_HOURS)
	public async cleanupSessions() {
		const userSessions = await this.redisService.keys(`user_sessions:*`)

		for (const userSession of userSessions) {
			const sessions = await this.redisService.hgetall(userSession)

			for (const sessionId in sessions) {
				const existSession = await this.redisService.exists(
					`sessions:${sessionId}`
				)

				if (!existSession) {
					await this.redisService.hdel(userSession, sessionId)
				}
			}
		}
	}

	private async getSessionDetails(session: any) {
		const keys = await this.redisService.keys(`user_sessions:${session.id}`)

		const promises = keys.map(async key => {
			const userSession = JSON.parse(await this.redisService.get(key))

			return {
				id: session.id,
				createdAt: userSession.createdAt,
				country: userSession.geo.name,
				city: userSession.geo.capital,
				browser: userSession.browser.name,
				os: userSession.os.name
			}
		})

		const details = await Promise.all(promises)

		return details[0] || null
	}
}
