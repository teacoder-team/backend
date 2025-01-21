import { Injectable } from '@nestjs/common'
import { User } from '@prisma/generated'
import sharp from 'sharp'

import { PrismaService } from '@/infra/prisma/prisma.service'
import { StorageService } from '@/services/storage/storage.service'

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
			}
		})

		return users
	}

	public async self(user: User) {
		return {
			id: user.id,
			displayName: user.displayName,
			avatar: user.avatar
		}
	}

	public async changeAvatar(user: User, file: Express.Multer.File) {
		if (user.avatar) {
			await this.storageService.deleteFile(user.avatar)
		}

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

		console.log(processedBuffer)

		const uploadedFile = await this.storageService.uploadFile(
			file,
			processedBuffer,
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
