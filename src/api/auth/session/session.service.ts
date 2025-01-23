import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { verify } from 'argon2'
import type { Request } from 'express'
import type { Repository } from 'typeorm'

import { RedisService } from '@/infra/redis/redis.service'

import { Account } from '../account/entities'

import type { LoginDto } from './dto'

@Injectable()
export class SessionService {
	public constructor(
		@InjectRepository(Account)
		private readonly accountRepository: Repository<Account>,
		private readonly redisService: RedisService
	) {}

	public async login(dto: LoginDto, ip: string, userAgent: string) {
		const { email, password } = dto

		const user = await this.accountRepository.findOne({
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

	public async findAll(req: Request, account: Account) {
		const token = req.headers['x-session-token'] as string
		const keys = await this.redisService.keys(`sessions:*`)

		if (keys.length === 0) {
			return []
		}

		const userSessions = await Promise.all(
			keys.map(async sessionKey => {
				const type = await this.redisService.type(sessionKey)
				if (type !== 'hash') {
					return null
				}

				const session = await this.redisService.hgetall(sessionKey)

				if (session.userId === account.id && session.token !== token) {
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
								browser: userSession.browser.name,
								os: userSession.os.name
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

	public async findCurrent(req: Request, account: Account) {
		const token = req.headers['x-session-token'] as string

		const keys = await this.redisService.keys(`sessions:*`)

		for (const key of keys) {
			const session = await this.redisService.hgetall(key)

			if (session.token === token && session.userId === account.id) {
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
							browser: userSession.browser.name,
							os: userSession.os.name
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

				return true
			}
		}

		throw new NotFoundException('Сессия не найдена')
	}
}
