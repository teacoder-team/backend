import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { hash } from 'argon2'
import { randomBytes } from 'crypto'
import validate from 'deep-email-validator'
import type { Repository } from 'typeorm'

import { slugify } from '@/common/utils'
import { RedisService } from '@/infra/redis/redis.service'

import type {
	CreateUserDto,
	PasswordResetDto,
	SendPasswordResetDto
} from './dto'
import { Account, PasswordReset } from './entities'

@Injectable()
export class AccountService {
	public constructor(
		@InjectRepository(Account)
		private readonly accountRepository: Repository<Account>,
		@InjectRepository(PasswordReset)
		private readonly passwordResetRepository: Repository<PasswordReset>,
		private readonly redisService: RedisService
	) {}

	public async fetch(account: Account) {
		return {
			id: account.id,
			email: account.email
		}
	}

	public async create(dto: CreateUserDto, ip: string, userAgent: string) {
		const { name, email, password } = dto

		const { valid } = await validate(email)

		if (!valid) {
			throw new BadRequestException('Невалидная почта')
		}

		const isExists = await this.accountRepository.findOne({
			where: {
				email
			}
		})

		if (isExists) {
			throw new ConflictException('Такой пользователь уже существует')
		}

		const account = await this.accountRepository.create({
			email,
			password: await hash(password),
			displayName: name,
			username: slugify(`${email}-${name}`)
		})

		await this.accountRepository.save(account)

		const session = await this.redisService.createSession(
			account,
			ip,
			userAgent
		)

		return session
	}

	public async sendPasswordReset(dto: SendPasswordResetDto) {
		const { email } = dto

		const user = await this.accountRepository.findOne({
			where: { email }
		})

		if (!user) {
			throw new NotFoundException('Пользователь не найден')
		}

		const token = randomBytes(64).toString('hex')

		const expiry = new Date()
		expiry.setHours(expiry.getHours() + 1)

		await this.passwordResetRepository.save({
			user,
			token,
			expiry
		})

		return true
	}

	public async passwordReset(dto: PasswordResetDto) {
		const { token, password } = dto

		const reset = await this.passwordResetRepository.findOne({
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

		const account = await reset.account

		await this.accountRepository.update(account.id, {
			password: await hash(password)
		})

		await this.passwordResetRepository.delete(reset.id)

		return true
	}
}
