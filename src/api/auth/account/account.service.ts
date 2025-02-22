import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { DeletionStatus, type User } from '@prisma/generated'
import { hash, verify } from 'argon2'
import { randomBytes } from 'crypto'
import validate from 'deep-email-validator'

import { slugify } from '@/common/utils'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'

import {
	ChangeEmailRequest,
	ChangePasswordRequest,
	ConfirmDeletionRequest,
	CreateUserRequest,
	PasswordResetRequest,
	SendPasswordResetRequest
} from './dto'

@Injectable()
export class AccountService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService
	) {}

	public async me(user: User) {
		return {
			id: user.id,
			displayName: user.displayName,
			email: user.email,
			avatar: user.avatar
		}
	}

	public async create(dto: CreateUserRequest, ip: string, userAgent: string) {
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
			ip,
			userAgent
		)

		return session
	}

	public async sendPasswordReset(dto: SendPasswordResetRequest) {
		const { email } = dto

		const user = await this.prismaService.user.findUnique({
			where: {
				email
			}
		})

		if (!user) throw new NotFoundException('Пользователь не найден')

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

	public async passwordReset(dto: PasswordResetRequest) {
		const { token, password } = dto

		const reset = await this.prismaService.passwordReset.findUnique({
			where: {
				token
			}
		})

		if (!reset) {
			throw new NotFoundException('Токен не найден')
		}

		if (new Date() > reset.expiry) {
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

	public async changeEmail(user: User, dto: ChangeEmailRequest) {
		const { email } = dto

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				email
			}
		})

		return true
	}

	public async changePassword(user: User, dto: ChangePasswordRequest) {
		const { currentPassword, newPassword } = dto

		const isValidPassword = await verify(user.password, currentPassword)

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

	public async deleteAccount(user: User) {
		const existingDeletion =
			await this.prismaService.deletionInfo.findUnique({
				where: {
					status: DeletionStatus.SCHEDULED,
					userId: user.id
				}
			})

		if (existingDeletion) {
			throw new ConflictException('Запрос на удаление уже создан')
		}

		const token = randomBytes(64).toString('hex')

		const expiry = new Date()
		expiry.setHours(expiry.getHours() + 1)

		await this.prismaService.deletionInfo.create({
			data: {
				token,
				expiry,
				user: {
					connect: {
						id: user.id
					}
				}
			}
		})

		return true
	}

	public async confirmDeletion(user: User, dto: ConfirmDeletionRequest) {
		const { token } = dto

		const deletion = await this.prismaService.deletionInfo.findUnique({
			where: {
				userId: user.id
			}
		})

		if (!deletion)
			throw new NotFoundException('Запрос на удаление не найден')

		if (deletion.token !== token)
			throw new BadRequestException('Неверный токен')

		if (new Date() > deletion.expiry)
			throw new BadRequestException('Срок действия токена истёк')

		const after = new Date()
		after.setDate(after.getDate() + 7)

		await this.prismaService.deletionInfo.update({
			where: {
				token,
				userId: user.id
			},
			data: {
				status: DeletionStatus.SCHEDULED,
				token: null,
				expiry: null,
				after
			}
		})

		return true
	}
}
