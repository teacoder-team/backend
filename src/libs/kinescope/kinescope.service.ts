import { HttpService } from '@nestjs/axios'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { lastValueFrom } from 'rxjs'

import {
	type KinescopeOptions,
	KinescopeOptionsSymbol,
	type KinescopeVideoResponse
} from '@/common/interfaces'

@Injectable()
export class KinescopeService {
	private readonly logger = new Logger(KinescopeService.name)

	private readonly token: string
	private readonly projectId: string

	public constructor(
		@Inject(KinescopeOptionsSymbol)
		private readonly options: KinescopeOptions,
		private readonly httpService: HttpService
	) {
		this.token = this.options.token
		this.projectId = this.options.projectId
	}

	public async uploadVideo(
		title: string,
		file: Express.Multer.File
	): Promise<KinescopeVideoResponse> {
		const url = `https://uploader.kinescope.io/v2/video`

		try {
			const response = await lastValueFrom(
				this.httpService.post(url, file.buffer, {
					headers: {
						Authorization: `Bearer ${this.token}`,
						'X-Parent-ID': this.projectId,
						'X-Video-Title': title,
						'Content-Type': file.mimetype,
						'X-File-Name': file.filename
					}
				})
			)

			return response.data.data
		} catch (error) {
			this.logger.error(
				`Error when uploading video. Error: ${error.message}`,
				error.stack
			)
			throw new Error(
				`Error when uploading video. Error: ${error.message}`
			)
		}
	}
}
