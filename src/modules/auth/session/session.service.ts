import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { User } from '@prisma/generated'
import { verify } from 'argon2'
import type { Request } from 'express'
import { TOTP } from 'otpauth'

import { PrismaService } from '@/core/prisma/prisma.service'
import { RedisService } from '@/core/redis/redis.service'

import { LoginDto } from './dto/login.dto'

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly configService: ConfigService
	) {}

	public async login(req: Request, dto: LoginDto, userAgent: string) {
		const { email, password, pin } = dto

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

		if (user.isTotpEnabled) {
			if (!pin) {
				return {
					message: 'Необходим код для завершения авторизации'
				}
			}

			const totp = new TOTP({
				issuer: 'TeaCoder',
				label: `${user.email}`,
				algorithm: 'SHA1',
				digits: 6,
				secret: user.totpSecret
			})

			const delta = totp.validate({ token: pin })

			if (delta === null) {
				throw new BadRequestException('Неверный код')
			}
		}

		const session = await this.redisService.createSession(
			user,
			req,
			userAgent
		)

		return session
	}

	public async logout(req: Request) {
		const token = req.headers['x-session-token'] as string

		const keys = await this.redisService.keys(`sessions:*`)

		for (const key of keys) {
			const session = await this.redisService.hgetall(key)

			if (session.token === token) {
				await this.redisService.del(key)

				const userSessionKeys =
					await this.redisService.keys(`user_sessions:*`)

				for (const userSessionKey of userSessionKeys) {
					const userSession = JSON.parse(
						await this.redisService.get(userSessionKey)
					)

					if (userSession.sessionId === session.id) {
						await this.redisService.del(userSessionKey)
					}
				}

				return true
			}
		}

		throw new UnauthorizedException('Invalid or expired session')
	}

	public async findAll(req: Request, user: User) {
		const token = req.headers['x-session-token'] as string
		const keys = await this.redisService.keys(`sessions:*`)

		if (keys.length === 0) {
			return []
		}

		const userSessions = await Promise.all(
			keys.map(async sessionKey => {
				const session = await this.redisService.hgetall(sessionKey)

				if (session.userId === user.id && session.token !== token) {
					const userSessionKeys =
						await this.redisService.keys(`user_sessions:*`)

					for (const userSessionKey of userSessionKeys) {
						const userSession = JSON.parse(
							await this.redisService.get(userSessionKey)
						)

						if (userSession.sessionId === session.id) {
							return {
								id: session.id,
								createdAt: userSession.createdAt,
								country: userSession.geo.name,
								city: userSession.geo.capital,
								browser: userSession.client.name,
								os: userSession.os.name,
								type: userSession.device.type
							}
						}
					}

					return { session }
				}

				return null
			})
		)

		return userSessions.filter(session => session !== null)
	}

	public async findCurrent(req: Request, user: User) {
		const token = req.headers['x-session-token'] as string

		const keys = await this.redisService.keys(`sessions:*`)

		for (const key of keys) {
			const session = await this.redisService.hgetall(key)

			if (session.token === token && session.userId === user.id) {
				const userSessionKeys =
					await this.redisService.keys(`user_sessions:*`)

				for (const userSessionKey of userSessionKeys) {
					const userSession = JSON.parse(
						await this.redisService.get(userSessionKey)
					)

					if (userSession.sessionId === session.id) {
						return {
							id: session.id,
							createdAt: userSession.createdAt,
							name: session.name,
							country: userSession.geo.name,
							city: userSession.geo.capital,
							browser: userSession.client.name,
							os: userSession.os.name,
							type: userSession.device.type
						}
					}
				}

				return { session }
			}
		}

		throw new UnauthorizedException('Session not found or expired')
	}

	public async remove(req: Request, id: string) {
		const token = req.headers['x-session-token'] as string

		const keys = await this.redisService.keys(`sessions:*`)

		let currentSessionKey: string | null = null

		for (const key of keys) {
			const session = await this.redisService.hgetall(key)

			if (session.token === token) {
				currentSessionKey = key

				if (session.id === id) {
					throw new BadRequestException(
						'Невозможно удалить текущую сессию'
					)
				}
			}
		}

		if (!currentSessionKey) {
			throw new UnauthorizedException('Текущая сессия не найдена')
		}

		for (const key of keys) {
			const session = await this.redisService.hgetall(key)

			if (session.id === id) {
				const userSessionKeys =
					await this.redisService.keys(`user_sessions:*`)

				for (const userSessionKey of userSessionKeys) {
					const userSession = JSON.parse(
						await this.redisService.get(userSessionKey)
					)

					if (userSession.sessionId === id) {
						await this.redisService.del(userSessionKey)
					}
				}

				await this.redisService.del(key)

				return {
					message: `Сессия с ID ${id} успешно удалена`
				}
			}
		}

		throw new NotFoundException('Сессия не найдена')
	}
}
