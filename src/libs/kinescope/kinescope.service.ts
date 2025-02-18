import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import { lastValueFrom } from 'rxjs'

import {
	type KinescopeOptions,
	KinescopeOptionsSymbol,
	type KinescopeVideoResponse
} from '@/common/interfaces'

@Injectable()
export class KinescopeService {
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
		buffer: Buffer,
		filename: string,
		mimetype: string
	): Promise<KinescopeVideoResponse> {
		const url = `https://uploader.kinescope.io/v2/video`

		try {
			const response = await lastValueFrom(
				this.httpService.post(url, buffer, {
					headers: {
						Authorization: `Bearer ${this.token}`,
						'X-Parent-ID': this.projectId,
						'X-Video-Title': title,
						'Content-Type': mimetype,
						'X-File-Name': filename
					}
				})
			)

			return response.data.data
		} catch (error) {
			throw new Error(
				`Error when uploading video. Error: ${error.message}`
			)
		}
	}
}
