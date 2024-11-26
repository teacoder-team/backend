import {
	BadRequestException,
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UserRole } from '@prisma/generated'
import { verify } from 'argon2'
import type { Request } from 'express'
import { TOTP } from 'otpauth'

import { PrismaService } from '@/core/prisma/prisma.service'
import { RedisService } from '@/core/redis/redis.service'
import { getSessionMetadata } from '@/shared/utils/session-metadata.util'

import { LoginDto } from './dto/login.dto'

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly redisService: RedisService
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

		const referer = req.get('Referer') || req.get('Origin')

		if (
			referer &&
			referer.includes('manage.teacoder.ru') &&
			user.role !== UserRole.ADMIN
		) {
			throw new UnauthorizedException(
				'У вас нет прав для доступа в админ-панель'
			)
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

		const metadata = getSessionMetadata(req, userAgent)

		return new Promise((resolve, reject) => {
			req.login(user, err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Не удалось сохранить сессию'
						)
					)
				}

				req.session.createdAt = new Date()
				req.session.metadata = metadata

				req.session.save(saveErr => {
					if (saveErr) {
						return reject(
							new InternalServerErrorException(
								'Не удалось сохранить данные сессии'
							)
						)
					}
					resolve({ user })
				})
			})
		})
	}

	public async logout(req: Request): Promise<void> {
		return new Promise((resolve, reject) => {
			req.session.destroy(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Не удалось завершить сессию'
						)
					)
				}
				this.clear(req)
				resolve()
			})
		})
	}

	public async findAll(req: Request) {
		const userId = req.session.passport.user

		const keys = await this.redisService.keys('*')

		const userSessions = []

		for (const key of keys) {
			const sessionData = await this.redisService.get(key)

			if (sessionData) {
				const session = JSON.parse(sessionData)

				if (session.passport.user === userId) {
					userSessions.push({
						id: key.split(':')[1],
						...session
					})
				}
			}
		}

		userSessions.sort((a, b) => b.createdAt - a.createdAt)

		return userSessions.filter(session => session.id !== req.session.id)
	}

	public async findById(id: string, req: Request) {
		const sessionData = await this.redisService.get(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`
		)

		if (!sessionData) {
			throw new NotFoundException('Сессия не найдена')
		}

		const session = JSON.parse(sessionData)

		const userIdFromSession = session.passport.user
		const currentUserId = req.session.passport.user

		if (userIdFromSession !== currentUserId) {
			throw new UnauthorizedException(
				'Эта сессия принадлежит другому пользователю'
			)
		}

		return {
			id,
			...session
		}
	}

	public async findCurrent(req: Request) {
		const sessionId = req.session.id

		const sessionData = await this.redisService.get(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`
		)

		const session = JSON.parse(sessionData)

		return {
			id: sessionId,
			...session
		}
	}

	public async remove(req: Request, id: string) {
		if (req.session.id === id) {
			throw new ConflictException('Текущую сессию удалить нельзя')
		}

		await this.redisService.del(
			`${this.configService.getOrThrow<string>('SESSION_FOLDER')}${id}`
		)

		return true
	}

	public async clear(req: Request) {
		return req.res.clearCookie(
			this.configService.getOrThrow<string>('SESSION_NAME')
		)
	}
}
