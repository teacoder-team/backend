import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import sharp from 'sharp'
import type { Repository } from 'typeorm'

import { StorageService } from '@/services/storage/storage.service'

import { Account } from '../auth/account/entities'

@Injectable()
export class UsersService {
	public constructor(
		@InjectRepository(Account)
		private readonly accountRepository: Repository<Account>,
		private readonly storageService: StorageService
	) {}

	public async findAll() {
		const users = await this.accountRepository.find({
			order: {
				createdAt: 'DESC'
			},
			select: ['id', 'createdAt', 'displayName', 'email', 'role']
		})

		return users
	}

	public async self(account: Account) {
		return {
			id: account.id,
			displayName: account.displayName,
			avatar: account.avatar
		}
	}

	public async changeAvatar(account: Account, file: Express.Multer.File) {
		if (account.avatar) {
			await this.storageService.deleteFile(account.avatar)
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

		await this.accountRepository.update(account.id, {
			avatar: uploadedFile.file_id
		})

		return uploadedFile
	}
}
