import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { EmailVerificationStatus, type User } from '@prisma/generated'
import { hash } from 'argon2'
import { randomBytes } from 'crypto'
import { eq } from 'drizzle-orm'

import { TeamanagerBotService } from '@/api/bots/teamanager/teamanager.bot.service'
import { DatabaseService } from '@/infra/database/database.service'
import {
	emailVerification,
	passwordResets,
	subscriptions,
	users
} from '@/infra/database/drizzle/schema'
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
		private readonly databaseService: DatabaseService,
		private readonly redisService: RedisService,
		private readonly mailService: MailService,
		private readonly botService: TeamanagerBotService
	) {}

	public async getMe(user: User) {
		const [emailV] = await this.databaseService.db
			.select()
			.from(emailVerification)
			.where(eq(emailVerification.userId, user.id))
			.limit(1)

		const [subscription] = await this.databaseService.db
			.select()
			.from(subscriptions)
			.where(eq(subscriptions.userId, user.id))
			.limit(1)

		const isEmailVerified = emailV?.status === 'VERIFIED'
		const isPremium =
			subscription &&
			subscription.isActive &&
			(!subscription.expiresAt || subscription.expiresAt > new Date())

		const [u] = await this.databaseService.db
			.select()
			.from(users)
			.where(eq(users.id, user.id))
			.limit(1)

		return {
			id: u.id,
			displayName: u.displayName,
			email: u.email,
			avatar: u.avatar,
			isEmailVerified,
			isAutoBilling: u.isAutoBilling,
			isPremium
		}
	}

	public async create(dto: CreateUserRequest, ip: string, userAgent: string) {
		const { name, email, password, visitorId, requestId } = dto

		const existing = await this.databaseService.db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)

		if (existing.length > 0)
			throw new ConflictException('Такой пользователь уже существует')

		const hashed = await hash(password)

		const [user] = await this.databaseService.db
			.insert(users)
			.values({
				id: crypto.randomUUID(),
				displayName: name,
				username: slugify(`${email}-${name}`),
				email,
				password: hashed
			})
			.returning()

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
		const [existing] = await this.databaseService.db
			.select()
			.from(emailVerification)
			.where(eq(emailVerification.userId, user.id))
			.limit(1)

		if (existing?.status === 'VERIFIED')
			throw new ConflictException('Эта почта уже подтверждена')

		if (existing) {
			await this.databaseService.db
				.delete(emailVerification)
				.where(eq(emailVerification.userId, user.id))
		}

		const token = randomBytes(64).toString('hex')

		const expiry = new Date()
		expiry.setHours(expiry.getHours() + 1)

		await this.databaseService.db.insert(emailVerification).values({
			id: crypto.randomUUID(),
			token,
			expiry,
			status: 'PENDING',
			userId: user.id
		})

		await this.mailService.sendEmailVerification(user, token)

		return true
	}

	public async verifyEmail(token: string) {
		const [ev] = await this.databaseService.db
			.select()
			.from(emailVerification)
			.where(eq(emailVerification.token, token))
			.limit(1)

		if (!ev) throw new NotFoundException('Токен не найден')
		if (new Date() > ev.expiry)
			throw new BadRequestException('Срок действия токена истек')

		await this.databaseService.db
			.update(emailVerification)
			.set({
				status: 'VERIFIED',
				expiry: null
			})
			.where(eq(emailVerification.token, token))

		return true
	}

	public async sendPasswordReset(dto: SendPasswordResetRequest) {
		const { email } = dto

		const [user] = await this.databaseService.db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)

		if (!user) throw new NotFoundException('Пользователь не найден')

		const token = randomBytes(64).toString('hex')

		const expiry = new Date()
		expiry.setHours(expiry.getHours() + 1)

		await this.databaseService.db
			.insert(passwordResets)
			.values({
				id: crypto.randomUUID(),
				userId: user.id,
				token,
				expiry
			})
			.onConflictDoUpdate({
				target: passwordResets.userId,
				set: { token, expiry }
			})

		await this.mailService.sendPasswordReset(user, token)

		return true
	}

	public async passwordReset(dto: PasswordResetRequest) {
		const { token, password } = dto

		const [reset] = await this.databaseService.db
			.select()
			.from(passwordResets)
			.where(eq(passwordResets.token, token))
			.limit(1)

		if (!reset) {
			throw new NotFoundException('Токен не найден')
		}

		if (new Date() > reset.expiry) {
			throw new BadRequestException('Срок действия токена истек')
		}

		await this.databaseService.db
			.update(users)
			.set({ password: await hash(password) })
			.where(eq(users.id, reset.userId))

		await this.databaseService.db
			.delete(passwordResets)
			.where(eq(passwordResets.id, reset.id))

		return true
	}

	public async changeEmail(user: User, dto: ChangeEmailRequest) {
		const { email } = dto

		const existing = await this.databaseService.db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1)

		if (existing.length > 0)
			throw new ConflictException(
				'Эта почта привязана к другому аккаунту'
			)

		await this.databaseService.db
			.update(users)
			.set({ email })
			.where(eq(users.id, user.id))

		return true
	}

	public async changePassword(user: User, dto: ChangePasswordRequest) {
		const { newPassword } = dto

		await this.databaseService.db
			.update(users)
			.set({ password: await hash(newPassword) })
			.where(eq(users.id, user.id))

		return true
	}
}
