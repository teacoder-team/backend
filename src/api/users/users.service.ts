import { Injectable } from '@nestjs/common'
import { User } from '@prisma/generated'
import sharp from 'sharp'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { StorageService } from '@/libs/storage/storage.service'

import { PatchUserRequest } from './dto'

@Injectable()
export class UsersService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly storageService: StorageService
	) {}

	public async findAll() {
		const users = await this.prismaService.user.findMany({
			orderBy: {
				createdAt: 'desc'
			},
			select: {
				id: true,
				createdAt: true,
				displayName: true,
				email: true,
				role: true
			}
		})

		return users
	}

	public async patchUser(user: User, dto: PatchUserRequest) {
		const { displayName } = dto

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				displayName
			},
			select: {
				id: true,
				displayName: true,
				email: true,
				avatar: true
			}
		})

		return true
	}

	public async changeAvatar(user: User, file: Express.Multer.File) {
		// if (user.avatar) {
		// 	await this.storageService.deleteFile(user.avatar)
		// }

		let processedBuffer: Buffer

		if (
			(file.originalname && file.originalname.endsWith('.gif')) ||
			(file.filename && file.filename.endsWith('.gif'))
		) {
			processedBuffer = await sharp(file.buffer, { animated: true })
				.resize(512, 512)
				.webp()
				.toBuffer()
		} else {
			processedBuffer = await sharp(file.buffer)
				.resize(512, 512)
				.webp()
				.toBuffer()
		}

		const uploadedFile = await this.storageService.uploadFile(
			file,
			'avatars'
		)

		await this.prismaService.user.update({
			where: {
				id: user.id
			},
			data: {
				avatar: uploadedFile.file_id
			}
		})

		return uploadedFile
	}
}
