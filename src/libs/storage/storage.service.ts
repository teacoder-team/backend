import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import FormData from 'form-data'

import type { FileResponse } from '@/common/interfaces'

@Injectable()
export class StorageService {
	private readonly storageUrl: string

	public constructor(
		private readonly configService: ConfigService,
		private readonly httpService: HttpService
	) {
		this.storageUrl = this.configService.getOrThrow<string>('STORAGE_URL')
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

			console.log(file, tag)

			const response = await this.httpService
				.post<FileResponse>(url, formData, {
					headers: {
						...formData.getHeaders()
					}
				})
				.toPromise()

			return response.data
		} catch (error) {
			throw new Error('Ошибка при загрузке файла: ' + error.message)
		}
	}

	public async deleteFile(key: string) {
		// const command: DeleteObjectCommandInput = {
		// 	Bucket: this.bucket,
		// 	Key: key
		// }
		// try {
		// 	await this.client.send(new DeleteObjectCommand(command))
		// } catch (error) {
		// 	throw error
		// }
	}
}
