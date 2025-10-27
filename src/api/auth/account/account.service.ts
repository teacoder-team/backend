import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { EmailVerificationStatus, type User } from '@prisma/generated'
import { hash } from 'argon2'
import { randomBytes } from 'crypto'

import { TeamanagerBotService } from '@/bots/teamanager/teamanager.bot.service'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { RedisService } from '@/infra/redis/redis.service'
import { MailService } from '@/libs/mail/mail.service'
import { slugify } from '@/shared/utils'

import {
	ChangeEmailRequest,
	ChangePasswordRequest,
	CreateUserRequest,
	PasswordResetRequest,
	SendPasswordResetRequest
} from './dto'

@Injectable()
export class AccountService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly redisService: RedisService,
		private readonly mailService: MailService,
		private readonly botService: TeamanagerBotService
	) {}

	public async getMe(user: User) {
		const emailVerification =
			await this.prismaService.emailVerification.findUnique({
				where: {
					userId: user.id
				}
			})

		const subscription = await this.prismaService.subscription.findUnique({
			where: {
				userId: user.id
			}
		})

		const isEmailVerified = emailVerification
			? emailVerification.status === EmailVerificationStatus.VERIFIED
			: false
		const isPremium = !!(
			subscription &&
			subscription.isActive &&
			(!subscription.expiresAt || subscription.expiresAt > new Date())
		)

		return {
			id: user.id,
			displayName: user.displayName,
			email: user.email,
			avatar: user.avatar,
			isEmailVerified,
			isAutoBilling: user.isAutoBilling,
			isPremium
		}
	}

	public async create(dto: CreateUserRequest, ip: string, userAgent: string) {
		const { name, email, password, visitorId, requestId } = dto

		// const { valid } = await validate(email)

		// if (!valid) {
		// 	throw new BadRequestException('Невалидная почта')
		// }

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

		const session = await this.redisService.createSession(user, {
			ip,
			userAgent,
			visitorId: visitorId ?? null,
			requestId: requestId ?? null
		})

		const userSession = await this.redisService.getUserSession(session.id)

		await this.botService.sendNewUser(user, userSession)

		return session
	}

	public async sendEmailVerification(user: User) {
		const emailVerification =
			await this.prismaService.emailVerification.findUnique({
				where: {
					userId: user.id
				}
			})

		if (
			emailVerification &&
			emailVerification.status === EmailVerificationStatus.VERIFIED
		) {
			throw new ConflictException('Эта почта уже подтверждена')
		}

		if (emailVerification) {
			await this.prismaService.emailVerification.delete({
				where: {
					userId: user.id
				}
			})
		}

		const token = randomBytes(64).toString('hex')

		const expiry = new Date()
		expiry.setHours(expiry.getHours() + 1)

		await this.prismaService.emailVerification.upsert({
			where: {
				token,
				userId: user.id
			},
			update: {
				token,
				expiry
			},
			create: {
				token,
				expiry,
				user: {
					connect: {
						id: user.id
					}
				}
			}
		})

		await this.mailService.sendEmailVerification(user, token)

		return true
	}

	public async verifyEmail(token: string) {
		const emailVerification =
			await this.prismaService.emailVerification.findUnique({
				where: {
					token
				}
			})

		if (!emailVerification) {
			throw new NotFoundException('Токен не найден')
		}

		if (new Date() > emailVerification.expiry) {
			throw new BadRequestException('Срок действия токена истек')
		}

		await this.prismaService.emailVerification.update({
			where: {
				token
			},
			data: {
				expiry: null,
				status: EmailVerificationStatus.VERIFIED
			}
		})

		return true
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

		await this.mailService.sendPasswordReset(user, token)

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

		const isExists = await this.prismaService.user.findFirst({
			where: {
				email
			}
		})

		if (isExists) {
			throw new ConflictException(
				'Эта почта привязана к другому аккаунту'
			)
		}

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
		const { newPassword } = dto

		// const isValidPassword = await verify(user.password, currentPassword)

		// if (!isValidPassword) {
		// 	throw new BadRequestException('Неверный старый пароль')
		// }

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
