import {
	BadRequestException,
	ConflictException,
	Injectable,
	InternalServerErrorException
} from '@nestjs/common'
import type { User } from '@prisma/generated'
import { hash, verify } from 'argon2'
import { randomBytes } from 'crypto'
import validate from 'deep-email-validator'
import type { Request } from 'express'
import * as sharp from 'sharp'

import { PrismaService } from '@/core/prisma/prisma.service'
import { StorageService } from '@/modules/storage/storage.service'
import { generateSlug } from '@/shared/utils/generate-slug.util'
import { getSessionMetadata } from '@/shared/utils/session-metadata.util'

import { ChangePasswordDto } from './dto/change-password.dto'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class AccountService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly storageService: StorageService
	) {}

	public async fetch(user: User) {
		return user
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
				username: generateSlug(`${email}-${name}`),
				email,
				password: await hash(password)
			}
		})

		const metadata = getSessionMetadata(req, userAgent)

		return new Promise((resolve, reject) => {
			req.session.createdAt = new Date()
			req.session.userId = user.id
			req.session.metadata = metadata

			req.session.save(err => {
				if (err) {
					return reject(
						new InternalServerErrorException(
							'Не удалось сохранить сессию'
						)
					)
				}
				resolve({ user })
			})
		})
	}

	public async changePassword(user: User, dto: ChangePasswordDto) {
		const { oldPassword, newPassword } = dto

		if (!(await verify(user.password, oldPassword))) {
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

	public async changeAvatar(user: User, file: Express.Multer.File) {
		if (user.picture) {
			await this.storageService.deleteFile(user.picture)
		}

		const fileName = `${randomBytes(16).toString('hex')}.webp`

		if (
			(file.originalname && file.originalname.endsWith('.gif')) ||
			(file.filename && file.filename.endsWith('.gif'))
		) {
			const processedBuffer = await sharp(file.buffer, { animated: true })
				.resize(512, 512)
				.webp()
				.toBuffer()

			await this.storageService.uploadFile(
				processedBuffer,
				fileName,
				'image/webp'
			)
		} else {
			const processedBuffer = await sharp(file.buffer)
				.resize(512, 512)
				.webp()
				.toBuffer()

			await this.storageService.uploadFile(
				processedBuffer,
				fileName,
				'image/webp'
			)
		}

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				picture: fileName
			}
		})

		return true
	}
}
