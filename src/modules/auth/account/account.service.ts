import {
	BadRequestException,
	ConflictException,
	Injectable
} from '@nestjs/common'
import { AuthMethod, type User } from '@prisma/generated'
import { hash, verify } from 'argon2'
import validate from 'deep-email-validator'
import type { Request } from 'express'
import * as sharp from 'sharp'

import { PrismaService } from '@/core/prisma/prisma.service'
import { StorageService } from '@/modules/storage/storage.service'
import { generateSlug } from '@/shared/utils/generate-slug.util'
import { saveSession } from '@/shared/utils/save-session.util'
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
				password: await hash(password),
				method: AuthMethod.CREDENTIALS
			}
		})

		const metadata = getSessionMetadata(req, userAgent)

		return saveSession(req, user, metadata)
	}

	public async validateOAuth(req: any, userAgent: string) {
		let user = await this.prismaService.user.findUnique({
			where: {
				email: req.user.email
			}
		})

		if (!user) {
			user = await this.prismaService.user.create({
				data: {
					email: req.user.email,
					displayName: req.user.name,
					username: generateSlug(
						`${req.user.email}-${req.user.name}`
					),
					picture: req.user.picture,
					method: AuthMethod['GOOGLE']
				}
			})
		}

		const metadata = getSessionMetadata(req, userAgent)

		return saveSession(req, user, metadata)
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

	public async changeAvatar(user: User, file: Express.Multer.File) {
		if (user.picture) {
			await this.storageService.deleteFile(user.picture)
		}

		const fileName = `/users/${user.id}.webp`

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
