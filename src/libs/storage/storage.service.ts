import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import FormData from 'form-data'
import { lastValueFrom } from 'rxjs'

import type { FileResponse } from '@/common/interfaces'

@Injectable()
export class StorageService {
	private readonly logger = new Logger(StorageService.name)

	private readonly storageUrl: string
	private readonly apiKey: string

	public constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService
	) {
		this.storageUrl = this.configService.getOrThrow<string>('STORAGE_URL')
		this.apiKey = this.configService.getOrThrow<string>('STORAGE_API_KEY')
	}

	public async uploadFile(
		file: Express.Multer.File,
		buffer: Buffer,
		tag: string
	) {
		const url = `${this.storageUrl}/upload`

		try {
			const formData = new FormData()

			formData.append('file', buffer, {
				filename: file.originalname,
				contentType: file.mimetype
			})
			formData.append('tag', tag)

			const response = await lastValueFrom(
				this.httpService.post<FileResponse>(url, formData, {
					headers: {
						'X-Upload-Secret': this.apiKey,
						...formData.getHeaders()
					}
				})
			)

			return response.data
		} catch (error) {
			this.logger.error(
				`❌ Failed when uploading file. Error: ${error.message}`,
				error.stack
			)
			throw new Error(
				`❌ Failed when uploading file. Error: ${error.message}`
			)
		}
	}

	public async deleteFile(tag: string, id: string) {
		const url = `${this.storageUrl}/${tag}/${id}`

		try {
			const response = await lastValueFrom(
				this.httpService.delete(url, {
					headers: {
						'X-Upload-Secret': this.apiKey
					}
				})
			)

			return response.data
		} catch (error) {
			this.logger.error(
				`❌ Failed when deleting file. Error: ${error.message}`,
				error.stack
			)
			throw new Error(
				`❌ Failed when deleting file. Error: ${error.message}`
			)
		}
	}
}
