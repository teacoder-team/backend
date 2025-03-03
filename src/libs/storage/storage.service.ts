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

	public constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService
	) {
		this.storageUrl = this.configService.getOrThrow<string>('STORAGE_URL')
	}

	public async uploadFile(file: Express.Multer.File, tag: string) {
		const url = `${this.storageUrl}/upload`

		try {
			const formData = new FormData()

			formData.append('file', file.buffer, {
				filename: file.originalname,
				contentType: file.mimetype
			})
			formData.append('tag', tag)

			const response = await lastValueFrom(
				this.httpService.post<FileResponse>(url, formData, {
					headers: {
						...formData.getHeaders()
					}
				})
			)

			return response.data
		} catch (error) {
			this.logger.error(
				`Error when uploading file. Error: ${error.message}`,
				error.stack
			)
			throw new Error(
				`Error when uploading file. Error: ${error.message}`
			)
		}
	}
}
