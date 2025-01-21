import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { type User } from '@prisma/generated'
import { hash, verify } from 'argon2'
import { randomBytes } from 'crypto'
import validate from 'deep-email-validator'
import type { Request } from 'express'

import { slugify } from '@/common/utils/slugify'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'

import { ChangePasswordDto } from './dto/change-password.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { PasswordResetDto } from './dto/password-reset.dto'
import { SendPasswordResetDto } from './dto/send-password-reset.dto'

@Injectable()
export class AccountService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService
	) {}

	public async fetch(user: User) {
		return {
			id: user.id,
			email: user.email
		}
	}

	public async create(req: Request, dto: CreateUserDto, userAgent: string) {
		const { name, email, password } = dto

		const { valid } = await validate(email)

		if (!valid) {
			throw new BadRequestException('Невалидная почта')
		}

		const isExists = await this.prismaService.user.findFirst({
			where: {
				email
			}
		})

		if (isExists) {
			throw new ConflictException('Такой пользователь уже существует')
		}

		const user = await this.prismaService.user.create({
			data: {
				displayName: name,
				username: slugify(`${email}-${name}`),
				email,
				password: await hash(password)
			}
		})

		const session = await this.redisService.createSession(
			user,
			req,
			userAgent
		)

		return session
	}

	public async sendPasswordReset(dto: SendPasswordResetDto) {
		const { email } = dto

		const user = await this.prismaService.user.findUnique({
			where: { email }
		})

		if (!user) {
			throw new NotFoundException('Пользователь не найден')
		}

		const token = randomBytes(64).toString('hex')

		const expiry = new Date()
		expiry.setHours(expiry.getHours() + 1)

		await this.prismaService.passwordReset.upsert({
			where: {
				userId: user.id
			},
			update: {
				token,
				expiry
			},
			create: {
				token,
				expiry,
				userId: user.id
			}
		})

		return true
	}

	public async passwordReset(dto: PasswordResetDto) {
		const { token, password } = dto

		const reset = await this.prismaService.passwordReset.findUnique({
			where: {
				token
			}
		})

		if (!reset) {
			throw new NotFoundException('Токен не найден')
		}

		const hasExpired = new Date(reset.expiry) < new Date()

		if (hasExpired) {
			throw new BadRequestException('Срок действия токена истек')
		}

		await this.prismaService.user.update({
			where: {
				id: reset.userId
			},
			data: {
				password: await hash(password)
			}
		})

		await this.prismaService.passwordReset.delete({
			where: {
				id: reset.id
			}
		})

		return true
	}

	public async changePassword(user: User, dto: ChangePasswordDto) {
		const { oldPassword, newPassword } = dto

		const isValidPassword = await verify(user.password, oldPassword)

		if (!isValidPassword) {
			throw new BadRequestException('Неверный старый пароль')
		}

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				password: await hash(newPassword)
			}
		})

		return true
	}
}
